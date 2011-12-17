Notification = {
 initialized : false,
 NOT_ALLOWED : 1,
 NOT_SUPPORTED : 2,

 //初期化(標準仕様に準拠させる)利用前に必ず実行する
 init : function () {
  if (typeof webkitNotifications === 'undefined') {
   return false;
  }
  this.initialized = true;
  if (typeof webkitNotifications.PERMISSION_ALLOWED === 'undefined') {
   webkitNotifications.PERMISSION_ALLOWED = 0;
   webkitNotifications.PERMISSION_NOT_ALLOWED = 1;
   webkitNotifications.PERMISSION_DENIED = 2;
  }
  if (typeof webkitNotifications.permissionLevel === 'undefined') {
   webkitNotifications.__defineGetter__('permissionLevel',function(){
    return this.checkPermission();
   });
   webkitNotifications.__defineSetter__('permissionLevel',function(){
   });
  }
  if (!webkitNotifications.createWebNotification) {
   webkitNotifications.createWebNotification = webkitNotifications.createHTMLNotification;
  }
  return true;
 },

 //作成したNotificationオブジェクトを返す。
 create : function (title, message, icon) {
  if (!this.initialized) {
   if (!this.init()) {
    //ブラウザがNotifications APIに対応していない
    throw Notification.NOT_SUPPORTED;
   }
  }
  if (webkitNotifications.permissionLevel !== webkitNotifications.PERMISSION_ALLOWED) {
   //許可されていない
   throw Notification.NOT_ALLOWED;
  } else {
   return webkitNotifications.createNotification(icon, title, message);
  }
 },

 //ユーザーにダイアログを表示する許可をもらう
 //(この関数はユーザーが発生させたマウスイベント等の中でのみ正しく実行される。)
 ask : function (f) {
  webkitNotifications.requestPermission(f || function (){});
 }
};

