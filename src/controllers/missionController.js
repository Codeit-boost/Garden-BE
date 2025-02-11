const asyncHandler = require('../utils/asyncHandler');
const missionService = require('../services/missionService');

//완료 X 미션목록 반환
const getMissions = async(req, res, next) => {
  const memberId = req.user.id;
  try{
    const getUncompletedMission = await missionService.uncompletedMission(memberId);
    res.json(getUncompletedMission);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMissions,
};