import { TypeValidate } from 'ifvendors/utils/validate-tool';
/**
 *
 *.3gpp	audio/3gpp， video/3gpp	3GPP Audio/Video
 *.ac3	audio/ac3	AC3 Audio
 *.asf	allpication/vnd.ms-asf	Advanced Streaming Format
 *.au	audio/basic	AU Audio
 *.css	text/css	Cascading Style Sheets
 *.csv	text/csv	Comma Separated Values
 *.doc	application/msword	MS Word Document
 *.dot	application/msword	MS Word Template
 *.dtd	application/xml-dtd	Document Type Definition
 *.dwg	image/vnd.dwg	AutoCAD Drawing Database
 *.dxf	image/vnd.dxf	AutoCAD Drawing Interchange Format
 *.gif	image/gif	Graphic Interchange Format
 *.htm	text/html	HyperText Markup Language
 *.html	text/html	HyperText Markup Language
 *.jp2	image/jp2	JPEG-2000
 *.jpe	image/jpeg	JPEG
 *.jpeg	image/jpeg	JPEG
 *.jpg	image/jpeg	JPEG
 *.js	text/javascript， application/javascript	JavaScript
 *.json	application/json	JavaScript Object Notation
 *.mp2	audio/mpeg， video/mpeg	MPEG Audio/Video Stream， Layer II
 *.mp3	audio/mpeg	MPEG Audio Stream， Layer III
 *.mp4	audio/mp4， video/mp4	MPEG-4 Audio/Video
 *.mpeg	video/mpeg	MPEG Video Stream， Layer II
 *.mpg	video/mpeg	MPEG Video Stream， Layer II
 *.mpp	application/vnd.ms-project	MS Project Project
 *.ogg	application/ogg， audio/ogg	Ogg Vorbis
 *.pdf	application/pdf	Portable Document Format
 *.png	image/png	Portable Network Graphics
 *.pot	application/vnd.ms-powerpoint	MS PowerPoint Template
 *.pps	application/vnd.ms-powerpoint	MS PowerPoint Slideshow
 *.ppt	application/vnd.ms-powerpoint	MS PowerPoint Presentation
 *.rtf	application/rtf， text/rtf	Rich Text Format
 *.svf	image/vnd.svf	Simple Vector Format
 *.tif	image/tiff	Tagged Image Format File
 *.tiff	image/tiff	Tagged Image Format File
 *.txt	text/plain	Plain Text
 *.wdb	application/vnd.ms-works	MS Works Database
 *.wps	application/vnd.ms-works	Works Text Document
 *.xhtml	application/xhtml+xml	Extensible HyperText Markup Language
 *.xlc	application/vnd.ms-excel	MS Excel Chart
 *.xlm	application/vnd.ms-excel	MS Excel Macro
 *.xls	application/vnd.ms-excel	MS Excel Spreadsheet
 *.xlt	application/vnd.ms-excel	MS Excel Template
 *.xlw	application/vnd.ms-excel	MS Excel Workspace
 *.xml	text/xml， application/xml	Extensible Markup Language
 *.zip	aplication/zip	Compressed Archive
 */

/**
 * 从文件的扩展名获得文件的mime-type
 * @param {string} fileMimeType 文件mimeType
 * @returns {Array<string>}  文件的扩展名
 */
function fileTypeToToFileExtend(fileMimeType: string): Array<string> {
	let convertMap = {
		'audio/3gpp': ['.3gpp'],
		'video/3gpp': ['.3gpp'],
		'image/gif': ['.gif'],
		'image/jpeg': ['.jpeg', '.jpg', '.jfif'],
		'image/png': ['.png'],
		'application/zip': ['.zip'],
		'application/x-zip-compressed': ['.zip'],
		'audio/mp4': ['.mp4'],
		'video/mp4': ['.mp4'],
		'image/bmp': ['.bmp'],
		'video/x-msvideo': ['.avi'],
		'video/quicktime': ['.mov'],
		'video/x-flv': ['.flv'],
		'video/x-ms-wmv': ['.wmv']
	};

	return convertMap[fileMimeType];
}

/**
 * 文件选择的过滤器
 */
export interface FileSelectFilter {
	isValid: (file: File) => boolean;
}

/**
 * 文件选择的选项
 */
export interface FileSelectOptions {
	// 验证有效性(模块只是简单的过滤，如果提示失败或者成功的信息，
	// 可以不传这个值，在收到文件后自己处理)
	filters?: Array<FileSelectFilter>;
	multiple?: boolean; // 是否多选
	accept?: string;
	applyValidateFilter?: boolean; // 是否自动过滤格式无效的文件，还是交由外边处理，true表示自动过滤
}
let moduleInput: HTMLInputElement | null = null;

/**
 * 创建一个文件input元素
 * @param {string} accept 文件过滤
 * @param {boolean} [multiple=false] 是否多选
 * @returns {HTMLInputElement} file input元素
 */
function createInputElementIfNeed(
	accept: string,
	multiple: boolean = false
): HTMLInputElement {
	if (moduleInput) {
		moduleInput.remove();
		moduleInput = null;
	}

	moduleInput = document.createElement('input');
	let inputElement = moduleInput;
	document.body.appendChild(inputElement);

	inputElement.setAttribute('type', 'file');
	inputElement.setAttribute('accept', accept);
	if (multiple) {
		inputElement.setAttribute('multiple', 'multiple');
	}

	inputElement.style.zIndex = '-1';
	inputElement.style.position = 'absolute';
	inputElement.style.width = '0.1px';
	inputElement.style.height = '0.1px';

	return inputElement;
}

/**
 * 将accept字符串转换成mimeType集合(转换其中的expanded)
 * @param {string} accept input file的accept字符串
 * @returns {Set<string>} mimetype的集合
 */
export function convertAcceptTypeToMimeType(accept: string): Set<string> {
	let acceptArray: Array<string> = accept.split(',');
	let results = [];
	for (let item of acceptArray) {
		let trimStr = item.trim();
		if (!trimStr.startsWith('.')) {
			// 找到extend
			let extend = fileTypeToToFileExtend(trimStr);
			if (extend) {
				results.push(...extend);
			}
		} else {
			// 默认为.扩展名
			results.push(trimStr);
		}
	}

	let mimeTypeSet = new Set(results);
	return mimeTypeSet;
}

class FileSelect {
	static showFileSelectDialog(
		selectOptions: FileSelectOptions,
		okCallback: (files: Array<File>, unvalidFiles: Array<File>) => void // 当selectOptions的applyValidateFilter为true，files表示有效的文件，false则表示选择的文件
	) {
		//
		let input: HTMLInputElement = createInputElementIfNeed(
			selectOptions.accept || '',
			selectOptions.multiple || false
		);

		let validTypes: Set<string> = convertAcceptTypeToMimeType(
			selectOptions.accept || ''
		);

		// 默认为true
		let applyValidateFilter = !!selectOptions.applyValidateFilter;

		function inputChange(event: Event) {
			// @ts-ignore
			let selectedFiles = this.files;
			if (selectedFiles) {
				let validFiles: Array<File> = [];
				let unvalidFiles: Array<File> = [];
				for (let i = 0; i < selectedFiles.length; i++) {
					let file: File = selectedFiles[i];

					// 文件扩展名
					let name = file.name;
					let fileExtend = name.substr(name.lastIndexOf('.'));
					if (validTypes.has(fileExtend.toLowerCase())) {
						validFiles.push(file);
					} else {
						unvalidFiles.push(file);
					}
				}

				// 最终有效的文件
				if (TypeValidate.isFunction(okCallback)) {
					if (applyValidateFilter) {
						okCallback(validFiles, unvalidFiles);
					} else {
						okCallback(selectedFiles, unvalidFiles);
					}
				}
			}

			// 处理完成
			input.remove();
			moduleInput = null;
		}
		// 事件处理
		// input.removeEventListener('change', inputChange);
		input.addEventListener('change', inputChange);

		// 显示文件选择框
		input.click();
	}

	static isValidFile(file: File, accept: string) {
		let validTypes: Set<string> = convertAcceptTypeToMimeType(accept || '');

		let name = file.name;
		let fileExtend = name.substr(name.lastIndexOf('.'));
		if (validTypes.has(fileExtend.toLowerCase())) {
			return true;
		} else {
			return false;
		}
	}
}

export default FileSelect;
