'use strict';

const bannedUserIds = [
  'BackwardSpy',
  'andygmb1'
];

const bannedStatusIdStrs = [
  '695016836237172737'
];

module.exports = (status) =>
  bannedStatusIdStrs.indexOf(status.id_str) === -1 &&
  bannedUserIds.indexOf(status.user.screen_name) === -1;
