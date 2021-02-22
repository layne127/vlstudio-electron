import { NgModule, Type } from '@angular/core';

import { SharedModule } from '@shared';
// single pages
import { CallbackComponent } from './callback/callback.component';
// dashboard pages
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserLockComponent } from './passport/lock/lock.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
import { UserRegisterResultComponent } from './passport/register-result/register-result.component';
import { UserRegisterComponent } from './passport/register/register.component';
import { RouteRoutingModule } from './routes-routing.module';

import { ProcessViewComponent } from '../biz/components/process-view/process-view.component';
import { ScenceViewComponent } from '../biz/components/scence-view/scence-view.component';
import { DragDirective } from '../biz/directives/drag.directive';
import { VlsplayerComponent } from './vlsplayer/vlsplayer.component';

const COMPONENTS: Type<void>[] = [
  DashboardComponent,
  // passport pages
  UserLoginComponent,
  UserRegisterComponent,
  UserRegisterResultComponent,
  // single pages
  CallbackComponent,
  UserLockComponent,
  ProcessViewComponent,
  ScenceViewComponent,
  VlsplayerComponent,
];
const COMPONENTS_NOROUNT: Type<void>[] = [];

@NgModule({
  imports: [SharedModule, RouteRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT, DragDirective],
})
export class RoutesModule {}
