// @ts-check
export default {
	"unconfigable": {  // 系统不可配置设置项
		"version": "v1.0.0",
		"systemName": '视频结构化平台', //系统名称
		"supportedFileFormat": { // 支持的文件格式
			'zipFileFormat': ['.zip'],  // 压缩包格式
			'picturalFileFormat': ['.png', '.jpg', '.jpeg', '.bmp'], // 图片格式
			// 'videoFileFormat': ['.mov', '.flv', '.avi', '.mp4'] // 视频格式
			'videoFileFormat': ['.mp4'] // 视频格式
		}
	},
	"configable": {  // 系统可配设置项
		"defaultLanguage": "zh-CN",
		// api请求地址配置
		"apiRequestAddress": {
			// 开发环境， 端口号根据不同的服务而不同， 具体可以参考http://192.168.2.150:8090/pages/viewpage.action?pageId=4293760
			'base-request': '127.0.0.1', // docker镜像构建时自动替换, 请确保打包后的文件名为main.******.js
			"ip": "request-ip",
			"port": "request-port"
		},

		// uri链接的前缀， docker镜像构建时自动替换ip(不包括端口号), 请确保打包后的文件名为main.******.js
		"uriPrefixV2": "127.0.0.1:9070",
		"uriPrefixV3": {
			"ip": "resource-ip",
			"port": "resource-port"
		},
		// "requestUrlHostMap": [
		// 	{
		// 		"from": "127.0.0.1:8762",
		// 		"flag": "g",
		// 		"to": "183.3.223.120:48762"
		// 	}
		// ],
		// "responeseUrlHostMap": [
		// 	{
		// 		"from": "127.0.0.1:8889",
		// 		"flag": "g",
		// 		"to": "183.3.223.120:48889"
		// 	},
		// 	{
		// 		"from": "127.0.0.1:9001",
		// 		"flag": "g",
		// 		"to": "183.3.223.120:39001"
		// 	}
		// ],
		"mqttServer": {  // mqtt服务器配置
			"ip": '192.168.8.235',
			"port": 9001
		},
		"thumbnailEnabled": true, // 启用缩略图
		"mapServer": {
			"mapType": "baiduOnline", // googleOnline谷歌在线地图，googleOffline谷歌离线地图， baiduOnline百度在线地图，baiduOffline百度离线地图
			"mapDefaultZoom": 12,
			"mapCenter": {
				"lng": 114.102316,
				"lat": 22.648365
			},
			"mapZoom": {
				"minZoom": 6,
				"maxZoom": 18
			},
			"serverUrl": {
				"baiduOffline": {
					"origin": 'http://127.0.0.1/ifaas/mapapi/tiles/{z}/{x}/{y}.png'
				},
				"baiduOnline": {
					"origin": 'http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20150518'
				},
				"googleOnline": {
					"origin": 'http://mt0.google.cn/vt/lyrs=m@160000000&hl=zh-CN&gl=CN&src=app&y={y}&x={x}&z={z}&s=Ga',
					"transforCoordinate": { //其他地图和百度点位的经纬度差
						"lat": -0.00604391488360179,
						"lng": -0.00649039475300128
					}
				},
				"googleOffline": {
					"origin": 'http://127.0.0.1/ifaas/mapapi/tiles/{z}/{x}/{y}.png', //注意ip和存放地图tile的路径以及离线地图的图片属性 jpg png
					"transforCoordinate": { //其他地图和百度点位的经纬度差
						"lat": -0.00604391488360179,
						"lng": -0.00649039475300128
					}
				}
			}
		},
		"mapLocusSpeed": 6000, //速度：m/s
		"defaultSimilarityThreshold": 92,  //默认显示相似度
		"defaultFaceSimilarityThreshold": 92,  //默认显示相似度
		"defaultBodySimilarityThreshold": 88,  //默认显示相似度
		"maxAreaLevels": 3  //默认摄像头区域管理层级数
	}
}
