const fs = require('fs');
const path = require('path');


async function saveFile(file, uploadDir) {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, file.name);
    await file.mv(filePath);
    return filePath;
}

module.exports = {
  saveFile
};
