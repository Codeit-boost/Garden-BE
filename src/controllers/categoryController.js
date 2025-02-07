const categoryService = require("../services/categoryService");

//사용자의 카테고리 목록
const getCategories = async(req, res) => {
    const memberId = req.user.id;
    const categories = await categoryService.myCategories(memberId);
    res.status(200).json(categories);
}

//카테고리 생성
const createCategory = async(req, res) => {
        const memberId = req.user.id;
        const { name } = req.body;

        const newCategory = await categoryService.createCategory(memberId, name);
        res.status(201).json({newCategory, message: "카테고리 생성완료"});
}


//카테고리명 수정
const updateCategory = async(req, res) => {
    const memberId = req.user.id;
    const { oldName, newName } = req.body;

    const updatedname = await categoryService.updateCategory(memberId, oldName, newName);
    res.status(200).json({updatedname, message: "카테고리 이름 업데이트 성공"});
}


//카테고리 삭제
const deleteCategory = async(req, res) => {
    const memberId = req.user.id;
    const { categoryName } = req.query;

    if (!categoryName) {
        return res.status(400).json({ message: "카테고리 이름이 필요합니다." });
    }

    await categoryService.deleteCategory(memberId, categoryName);

    res.status(200).json({message: '카테고리 삭제 성공'});
}

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
}