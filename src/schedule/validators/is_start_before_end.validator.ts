import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import * as dayjs from 'dayjs';
import { ScheduleQueryDto } from '../dtos/schedule_query.dto';

@ValidatorConstraint({ name: 'isStartBeforeEnd', async: false })
export class IsStartBeforeEnd implements ValidatorConstraintInterface {
  validate(startDate: string, args: ValidationArguments) {
    const queryParams = args.object as ScheduleQueryDto; // Strong typing
    const { endDate } = queryParams;

    if (!startDate || !endDate) return true; // Skip validation if either date is missing

    return dayjs(startDate).isBefore(dayjs(endDate));
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid date range: startDate must be before endDate.';
  }
}
