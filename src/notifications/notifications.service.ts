import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Notifications, NotificationType } from '@prisma/client';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable()
export class NotificationsService implements OnModuleDestroy {
  private userStreams = new Map<string, Subject<any>>();
  private userConnections = new Map<string, number>();

  constructor(private readonly prisma: PrismaService) {}

  subscribe(userId: string): Observable<any> {
    if (!this.userStreams.has(userId)) {
      this.userStreams.set(userId, new Subject());
      this.userConnections.set(userId, 0);
    }
    this.userConnections.set(
      userId,
      (this.userConnections.get(userId) || 0) + 1,
    );

    const observable = this.userStreams.get(userId)!.asObservable();
    return new Observable((observer) => {
      const subscription = observable.subscribe(observer);

      return () => {
        subscription.unsubscribe();
        this.handleConnectionClosed(userId);
      };
    });
  }

  private handleConnectionClosed(userId: string): void {
    const currentCount = this.userConnections.get(userId) || 0;
    if (currentCount <= 1) {
      this.userStreams.get(userId)?.complete();
      this.userStreams.delete(userId);
      this.userConnections.delete(userId);
    } else {
      this.userConnections.set(userId, currentCount - 1);
    }
  }

  private sendToUser(userId: string, notification: Notifications) {
    const stream = this.userStreams.get(userId);
    if (stream) {
      stream.next(JSON.stringify(notification));
    }
  }

  async readNotification(userId: string, notificationId: string) {
    await this.prisma.notifications.update({
      where: { id: notificationId },
      data: { read: true },
    });
    return { success: true, message: 'Notification marked as read.' };
  }

  async createNotification(
    userId: string,
    payload: {
      title: string;
      body: string;
      type: NotificationType;
      url?: string;
    },
  ) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });
    if (!user) {
      throw new Error('User not found, notification not sent');
    }
    const notification = await this.prisma.notifications.create({
      data: {
        userId,
        title: payload.title,
        body: payload.body,
        type: payload.type,
        url: payload.url,
      },
    });
    return this.sendToUser(userId, notification);
  }

  async getUnreadNotifications(userId: string, take = 10, skip = 0) {
    return await this.prisma.notifications.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notifications.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }

  async getNotifications(userId: string, take = 10, skip = 0) {
    const data = await this.prisma.notifications.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
    });
    const totalCount = await this.prisma.notifications.count({
      where: {
        userId,
        read: false,
      },
    });
    return { data, take, skip, totalCount };
  }

  onModuleDestroy() {
    for (const stream of this.userStreams.values()) {
      stream.complete();
    }
    this.userStreams.clear();
    this.userConnections.clear();
  }
}
