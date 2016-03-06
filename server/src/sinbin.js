'use strict';

const bannedUserIds = [
  'BackwardSpy',
  'andygmb1'
];

const bannedStatusIdStrs = [
  '695016836237172737',
  '694646309614174208',
  '694938865489047556',
  '695014425326059521',
  '706040109427093505'
];

module.exports = (status) =>
  bannedStatusIdStrs.indexOf(status.id_str) === -1 &&
  bannedUserIds.indexOf(status.user.screen_name) === -1;
