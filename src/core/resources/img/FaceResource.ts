/**
 * @description 人物脸型资源
 *
 * - img/faces 脸图规范:
 * - 脸图文件为 PNG,标准尺寸 576 * 288,位于 resources/img/faces/<faceName>.png
 * - 单张脸尺寸 faceSize 尺寸:144 * 144
 * - 引擎固定按 4 列解析脸图
 * - 因此标准脸图共 4 列 * 2 行 = 8 张脸,faceIndex 取值范围为 0 ~ faceCount - 1
 */

import { ImgResourceBase } from './ImgResourceBase'

/**
 * @description 脸图中的单张脸源矩形(相对于整张脸图左上角的像素区域)
 */
export interface FaceRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * @description 人物脸型资源,解析单张脸图文件的网格结构
 */
export class FaceResource extends ImgResourceBase {
  /**
   * @description 脸图资源目录
   */
  public static readonly BASE_PATH = 'resources/img/faces'
  /**
   * @description 引擎固定的脸图网格列数
   */
  public static readonly COLUMNS = 4

  /**
   * @description 默认单张脸尺寸,144 * 144 像素
   */
  public static readonly DEFAULT_FACE_SIZE = 144

  /**
   * @description 脸图文件名(不含 .png 扩展名),对应数据中的 faceName
   */
  public readonly faceName: string

  /**
   * @description 脸图整张像素宽度
   */
  public readonly imageWidth: number

  /**
   * @description 脸图整张像素高度
   */
  public readonly imageHeight: number

  /**
   * @description 单张脸像素宽度(faceSize)
   */
  public readonly faceWidth: number

  /**
   * @description 单张脸像素高度(faceSize)
   */
  public readonly faceHeight: number

  /**
   * @description 构造脸型资源
   * @param faceName 脸图文件名(不含扩展名)
   * @param imageWidth 脸图整张像素宽度
   * @param imageHeight 脸图整张像素高度
   * @param faceSize 单张脸像素尺寸,默认取 FaceResource.DEFAULT_FACE_SIZE
   */
  public constructor(
    faceName: string,
    imageWidth: number,
    imageHeight: number,
    faceSize: number = FaceResource.DEFAULT_FACE_SIZE,
  ) {
    super()
    if (!Number.isInteger(imageWidth) || imageWidth <= 0) {
      throw new RangeError(`脸图宽度必须为正整数,当前为 ${imageWidth}`)
    }
    if (!Number.isInteger(imageHeight) || imageHeight <= 0) {
      throw new RangeError(`脸图高度必须为正整数,当前为 ${imageHeight}`)
    }
    if (!Number.isInteger(faceSize) || faceSize <= 0) {
      throw new RangeError(`单张脸尺寸必须为正整数,当前为 ${faceSize}`)
    }
    this.faceName = faceName
    this.imageWidth = imageWidth
    this.imageHeight = imageHeight
    this.faceWidth = faceSize
    this.faceHeight = faceSize
  }
  /**
   * @description 脸图资源目录
   */
  public get basePath(): string {
    return FaceResource.BASE_PATH
  }
  /**
   * @description 脸图网格行数(图高除以单脸高,向下取整)
   */
  public get rows(): number {
    return Math.floor(this.imageHeight / this.faceHeight)
  }

  /**
   * @description 脸图可容纳的脸数量(列数乘以行数)
   */
  public get faceCount(): number {
    return FaceResource.COLUMNS * this.rows
  }

  /**
   * @description 判断 faceIndex 是否指向有效的脸
   * @param faceIndex 脸索引,对应数据中的 faceIndex
   */
  public hasFace(faceIndex: number): boolean {
    return Number.isInteger(faceIndex) && faceIndex >= 0 && faceIndex < this.faceCount
  }

  /**
   * @description 取 faceIndex 对应的脸源矩形
   * @param faceIndex 脸索引,取值范围 0 ~ faceCount - 1
   * @throws RangeError 当 faceIndex 超出有效范围时抛出
   */
  public getFaceRect(faceIndex: number): FaceRect {
    if (!this.hasFace(faceIndex)) {
      throw new RangeError(
        `脸图 ${this.faceName} 不存在索引为 ${faceIndex} 的脸,有效范围为 0 ~ ${this.faceCount - 1}`,
      )
    }
    return {
      x: (faceIndex % FaceResource.COLUMNS) * this.faceWidth,
      y: Math.floor(faceIndex / FaceResource.COLUMNS) * this.faceHeight,
      width: this.faceWidth,
      height: this.faceHeight,
    }
  }
}
