/* eslint-disable @typescript-eslint/camelcase */
import * as CV from 'class-validator';
import * as Models from '../dto';

@Models.Model()
export class UserDTO {
  @Models.Header('Authorization')
  public token: string;

  @CV.IsNumberString()
  @Models.Param()
  public userId: string;

  @CV.IsString()
  @Models.Body()
  public username: string;

  @CV.IsString()
  @Models.Body()
  public password: string;

  @CV.IsString()
  @Models.Body('confirm_password')
  public confirm_password: string;
}
