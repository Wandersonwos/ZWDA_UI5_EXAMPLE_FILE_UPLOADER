var MyFileUploader = MyFileUploader || {
    init: function (oCallbackApi, maxFilenameLength, maxFileSize, fileType) {
        if (fileType !== null) {
            var filetypeArray = fileType.split(",");
        } else {
            filetypeArray = null
        }
        this.oCallbackApi = oCallbackApi;
        this.oFileUploader = new sap.m.UploadCollection({
            maximumFilenameLength: parseInt(maxFilenameLength),
            maximumFileSize: parseInt(maxFileSize), // Specifies a file size limit in megabytes
            multiple: true,
            sameFilenameAllowed: false,
            instantUpload: false,
            fileType: filetypeArray,
            change: this.onChange,
            typeMissmatch: this.ontypeMissmatch,
            fileSizeExceed: this.onfileSizeExceed,
            filenameLengthExceed: this.onfilenameLengthExceed,
        });

        this.oFileUploader.placeAt("FileUploadUI5");
    },
    onChange: function (oControlEvent) {
        for (let index = 0; index < oControlEvent.mParameters["files"].length; index++) {
            const file = oControlEvent.mParameters["files"][index];
            // var file = oControlEvent.mParameters["files"][0];

            MyFileUploader.uploadToCallbackAPI(file);
            // MyFileUploader.oFileUploader.fireUploadComplete();
        }
    },
    ontypeMissmatch: function (oControlEvent) {
        let file = oControlEvent.mParameters["files"][0];
        MyFileUploader.oCallbackApi.fireEvent('UI5TypeMismatch', '{"filename":"' + file.name + '",' + '"filetype":"' + file.fileType + '"}');
    },
    onfilenameLengthExceed: function (oControlEvent) {
        let file = oControlEvent.mParameters["files"][0];
        MyFileUploader.oCallbackApi.fireEvent('UI5NameLenghtExceed', file.name );
    },
    onfileSizeExceed: function (oControlEvent) {
        let file = oControlEvent.mParameters["files"][0];
        MyFileUploader.oCallbackApi.fireEvent('UI5SizeExceed', file.name );
    },
    uploadToCallbackAPI(file) {

        if (file == null) {
            return;
        }
        var oFileReader = new FileReader();
        var fileName = file.name.split(".")[0];
        var fileType = file.name.split(".")[1];
        var mimetype = file.type;
        var size = file.size;

        oFileReader.onload = function (evt) {
            var raw = evt.target.result;
            var hexString = MyFileUploader.convertBinaryToHex(raw).toUpperCase();
            var fileAsJsonString = MyFileUploader.createJsonObjectForFileInfo(fileName, fileType, mimetype, size, hexString);

            MyFileUploader.oCallbackApi.fireEvent('UI5Upload', fileAsJsonString);

        };

        oFileReader.onerror = function (evt) {
            sap.m.MessageToast.show("error");
        };
        oFileReader.readAsArrayBuffer(file);


    },
    createJsonObjectForFileInfo: function (fileName, fileType, mimetype, size, hexString) {
        return '{"filename":"' + fileName + '",' +
            '"filetype":"' + fileType + '",' +
            '"mimetype":"' + mimetype + '",' +
            '"size":"' + size + '",' +
            '"hexcont":"' + hexString + '"}';
    },

    convertBinaryToHex: function (buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    },
    removeFirstFile: function (evt) {
        var oFirstFileItem = MyFileUploader.oFileUploader.getItems()[0];
        MyFileUploader.oFileUploader.removeItem(oFirstFileItem);
    }
}