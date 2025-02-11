const memberService = require('../services/memberService');

// 모든 회원 조회 (총 집중시간 순으로)
const getMembers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const members = await memberService.getMembersWithTotalFocusTime(parseInt(page), parseInt(limit));

  res.status(200).json({
    page: parseInt(page),
    limit: parseInt(limit),
    members,
  });
};

// 모든 친구 조회 (총 집중시간 순으로)
const getFriends = async (req, res) => {
  const memberId = req.user.id
  const { page = 1, limit = 10 } = req.query;

  const members = await memberService.getFriendsWithTotalFocusTime(memberId,parseInt(page), parseInt(limit));

  res.status(200).json({
    page: parseInt(page),
    limit: parseInt(limit),
    members,
  });
};

// 현재 회원 정보 조회
const getMyInfo = async (req, res) => {
  const memberId = req.user.id;
  const memberInfo = await memberService.getMemberInfo(memberId);
  res.status(200).json(memberInfo);
};

// 현재 회원 정보 수정
const updateMyInfo = async (req, res) => {
  const memberId = req.user.id;
  const { name, alarm, mode, sound } = req.body;

  const dataToUpdate = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (alarm !== undefined) dataToUpdate.alarm = alarm;
  if (mode !== undefined) dataToUpdate.mode = mode;
  if (sound !== undefined) dataToUpdate.sound = sound;

  const updatedMember = await memberService.updateMemberInfo(memberId, dataToUpdate);
  res.status(200).json(updatedMember);
};

// 현재 회원 삭제
const deleteMyAccount = async (req, res) => {
  const memberId = req.user.id;
  await memberService.deleteMemberAccount(memberId);
  res.status(204).send();
};

// 친구 추가
const makeFriend = async (req, res) => {
  const { friendEmail,friendId } = req.body;
  const memberId = req.user.id;
  
  if(friendId){
    const friendRequest = await memberService.addFriend(memberId, friendId);
    res.status(201).json({ message: '친구요청이 성공적으로 완료되었습니다.', friendRequest });
  }
  else if(friendEmail){
    const friendRequest = await memberService.addFriendByEmail(memberId, friendEmail);
    res.status(201).json({ message: '친구요청이 성공적으로 완료되었습니다.', friendRequest });
  }
  else{
    // 둘 다 없으면 에러 응답
    return res.status(400).json({ message: '친구 추가에 필요한 정보가 없습니다.' });
  }
};

// 친구 삭제
const removeFriend = async (req, res) => {
  const { friendId } = req.body;
  const memberId = req.user.id;

  await memberService.deleteFriend(memberId, friendId);
  res.status(204).send();
};

module.exports = {
  getMembers,
  getFriends,
  getMyInfo,
  updateMyInfo,
  deleteMyAccount,
  makeFriend,
  removeFriend,
};