exports.deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete file:', err);
    });
};