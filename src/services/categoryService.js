const { PrismaClient } = require('@prisma/client');
const { CustomError, ErrorCodes } = require('../utils/error');

const prisma = new PrismaClient();

const setupCategory = async (memberId) => {
    // 기본 카테고리 배열 (필요에 따라 수정 가능)
    const defaultCategories = ["공부", "운동", "독서"];

    // 기본 카테고리 생성 (중복 발생 시 건너뛰도록 설정)
    await prisma.category.createMany({
        data: defaultCategories.map((name) => ({
            memberId: Number(memberId),
            name,
        })),
        skipDuplicates: true,
    });
};

const myCategories = async(memberId) => {
    try{
        const categories = await prisma.category.findMany({
            where: {memberId: Number(memberId)},
            select: { name: true }
        });

        if(!categories || categories.length === 0){
            throw new CustomError(ErrorCodes.NotFound, '카테고리가 존재하지 않습니다.');
        }
        return categories;
    }catch(error){
        throw new CustomError(ErrorCodes.InternalServerError, '사용자의 카테고리 목록을 불러오는 도중 문제가 발생했습니다.');
    }
};


const createCategory = async(memberId, name) => {
    try{
        //중복된 카테고리명 확인
        const existingCategory = await prisma.category.findFirst({
            where:{
                memberId: Number(memberId),
                name: name
            }
        });

        if(existingCategory){
            throw new CustomError(ErrorCodes.Conflict, '이미 존재하는 카테고리 입니다.');
        }

        const newCategory = await prisma.category.create({
            data:{
                memberId: Number(memberId),
                name: name
            }
        });
        return newCategory;
    }catch(error){
        throw new CustomError(ErrorCodes.InternalServerError, '카테고리를 생성하는 도중 에러가 발생했습니다.');
    }
};

const updateCategory = async(memberId, oldName, newName) => {
    try{
        const category = await prisma.category.findFirst({
            where:{
                memberId: Number(memberId),
                name: oldName
            }
        });

        if (!category) {
            throw new CustomError(ErrorCodes.NotFound, '카테고리가 존재하지 않습니다.');
        }

        //중복된 카테고리명 확인
        const existingCategory = await prisma.category.findFirst({
            where:{
                memberId: Number(memberId),
                name: newName
            }
        });

        if(existingCategory){
            throw new CustomError(ErrorCodes.Conflict, '이미 존재하는 카테고리 입니다.');
        }

        const updatedCategory = await prisma.category.update({
            where: { id: category.id },
            data: { name: newName }
        });
        return updatedCategory;
    }catch(error){
        throw new CustomError(ErrorCodes.InternalServerError, '카테고리를 수정하는 도중 문제가 발생했습니다.');
    }
};

const deleteCategory = async(memberId, categoryName) => {
    try{
        const category = await prisma.category.findFirst({
            where: {
                memberId: Number(memberId),
                name: categoryName,
            }
        });

        if (!category) {
            throw new CustomError(ErrorCodes.NotFound, '카테고리가 존재하지 않습니다.');
        }

        await prisma.category.delete({
            where: { id: category.id }
        });
    }catch(error){
        throw new CustomError(ErrorCodes.InternalServerError, '카테고리를 삭제하는 도중 에러가 발생하였습니다.');
    }
};


module.exports = {
    setupCategory, 
    myCategories,
    createCategory,
    updateCategory,
    deleteCategory
}