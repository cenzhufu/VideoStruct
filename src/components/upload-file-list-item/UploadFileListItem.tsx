import * as React from 'react';
import { DeleteIconComponent } from 'stcomponents/icons';
import ModuleStyle from './index.module.scss';
// import StringTool from 'stutils/foundations/string';
import STComponent from 'stcomponents/st-component';

type PropsType = {
	className: string;
	file: File;
	fileError: string; // 错误信息
	onDelete: (file: File) => void;
};

class UploadFileListItem extends STComponent<PropsType> {
	static defaultProps = {
		className: '',
		fileError: false,
		onDelete: () => {}
	};

	onDelete = () => {
		this.props.onDelete(this.props.file);
	};

	render() {
		return (
			<div className={`${ModuleStyle['file-item']} ${this.props.className}`}>
				{this.props.fileError ? (
					<div className={ModuleStyle['file-name-and-error']}>
						<div
							className={ModuleStyle['file-name-error']}
							title={this.props.file.name}
						>
							{this.props.file.name}
						</div>
						<div
							className={ModuleStyle['file-name-error']}
							title={this.props.fileError}
						>
							{`(${this.props.fileError})`}
						</div>
					</div>
				) : (
					<div
						className={ModuleStyle['file-name-and-error']}
						title={this.props.file.name}
					>
						{this.props.file.name}
					</div>
				)}
				{/* <div className={ModuleStyle['file-size']}>
					{!this.props.fileError ? (
						StringTool.getFileSizeTip(this.props.file.size)
					) : (
						<span className={ModuleStyle['file-name-error']}>
							{StringTool.getFileSizeTip(this.props.file.size)}
						</span>
					)}
				</div> */}
				<DeleteIconComponent onDelete={this.onDelete} />
			</div>
		);
	}
}

export default UploadFileListItem;
