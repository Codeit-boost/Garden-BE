const asyncHandler = require('../utils/asyncHandler');
const memberService = require('../services/memberService');

// 현재 회원 정보 조회
const getMyInfo = asyncHandler(async (req, res) => {
  const memberId = req.user.id;
  const memberInfo = await memberService.getMemberInfo(memberId);
  res.status(200).json(memberInfo);
});

// 현재 회원 정보 수정
const updateMyInfo = asyncHandler(async (req, res) => {
  const memberId = req.user.id;
  const { name, alarm, mode, sound } = req.body;

  const dataToUpdate = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (alarm !== undefined) dataToUpdate.alarm = alarm;
  if (mode !== undefined) dataToUpdate.mode = mode;
  if (sound !== undefined) dataToUpdate.sound = sound;

  const updatedMember = await memberService.updateMemberInfo(memberId, dataToUpdate);
  res.status(200).json(updatedMember);
});

// 현재 회원 삭제
const deleteMyAccount = asyncHandler(async (req, res) => {
  const memberId = req.user.id;
  await memberService.deleteMemberAccount(memberId);
  res.status(204).send();
});

// 친구 추가
const makeFriend = asyncHandler(async (req, res) => {
  const { friendId } = req.body;
  const memberId = req.user.id;

  const friendRequest = await memberService.addFriend(memberId, friendId);
  res.status(201).json({ message: 'Friend request sent successfully.', friendRequest });
});

// 친구 삭제
const removeFriend = asyncHandler(async (req, res) => {
  const { friendId } = req.body;
  const memberId = req.user.id;

  await memberService.deleteFriend(memberId, friendId);
  res.status(204).send();
});

module.exports = {
  getMyInfo,
  updateMyInfo,
  deleteMyAccount,
  makeFriend,
  removeFriend,
};