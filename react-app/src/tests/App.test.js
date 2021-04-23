const { processImageList } = require('../App');

describe('processImageList', () => {
    it('should handle bad data', () => {
        const response = require('./bad-data.json');
        const mockSetBirdPics = jest.fn();
        const mockSetPicDates = jest.fn();
        const mockSetPicGroups = jest.fn();
        const mockSetUpdateTime = jest.fn();
        processImageList(response, mockSetBirdPics, mockSetPicDates, mockSetPicGroups, mockSetUpdateTime)
    })
});