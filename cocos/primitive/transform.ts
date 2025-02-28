/*
 Copyright (c) 2020 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

import { PrimitiveMode } from '../gfx';
import { IGeometry } from './define';

/**
 * @en
 * Translate the geometry.
 * @zh
 * 平移几何体。
 * @param geometry @zh 几何体信息。@en The geometry to be translated
 * @param offset @zh 偏移量。@en The translation
 */
export function translate (geometry: IGeometry, offset: { x?: number; y?: number; z?: number; }) {
    const x = offset.x || 0;
    const y = offset.y || 0;
    const z = offset.z || 0;
    const nVertex = Math.floor(geometry.positions.length / 3);
    for (let iVertex = 0; iVertex < nVertex; ++iVertex) {
        const iX = iVertex * 3;
        const iY = iVertex * 3 + 1;
        const iZ = iVertex * 3 + 2;
        geometry.positions[iX] += x;
        geometry.positions[iY] += y;
        geometry.positions[iZ] += z;
    }
    if (geometry.minPos) {
        geometry.minPos.x += x;
        geometry.minPos.y += y;
        geometry.minPos.z += z;
    }
    if (geometry.maxPos) {
        geometry.maxPos.x += x;
        geometry.maxPos.y += y;
        geometry.maxPos.z += z;
    }
    return geometry;
}

/**
 * @en
 * Scale the geometry.
 * @zh
 * 缩放几何体。
 * @param geometry @zh 几何体信息。 @en The geometry to be scaled
 * @param value @zh 缩放量。@en The scaling size
 */
export function scale (geometry: IGeometry, value: { x?: number; y?: number; z?: number }) {
    const x = value.x || 0;
    const y = value.y || 0;
    const z = value.z || 0;
    const nVertex = Math.floor(geometry.positions.length / 3);
    for (let iVertex = 0; iVertex < nVertex; ++iVertex) {
        const iX = iVertex * 3;
        const iY = iVertex * 3 + 1;
        const iZ = iVertex * 3 + 2;
        geometry.positions[iX] *= x;
        geometry.positions[iY] *= y;
        geometry.positions[iZ] *= z;
    }
    if (geometry.minPos) {
        geometry.minPos.x *= x;
        geometry.minPos.y *= y;
        geometry.minPos.z *= z;
    }
    if (geometry.maxPos) {
        geometry.maxPos.x *= x;
        geometry.maxPos.y *= y;
        geometry.maxPos.z *= z;
    }
    geometry.boundingRadius = Math.max(Math.max(x, y), z);
    return geometry;
}

/**
 * @en
 * Converts geometry to wireframe mode. Only geometry with triangle topology is supported.
 * @zh
 * 将几何体转换为线框模式，仅支持三角形拓扑的几何体。
 * @param geometry @zh 几何体信息。@en The geometry to be converted to wireframe
 */
export function wireframed (geometry: IGeometry) {
    const { indices } = geometry;
    if (!indices) {
        return geometry;
    }

    // We only support triangles' wireframe.
    if (geometry.primitiveMode && geometry.primitiveMode !== PrimitiveMode.TRIANGLE_LIST) {
        return geometry;
    }

    const offsets = [[0, 1], [1, 2], [2, 0]];
    const lines: number[] = [];
    const lineIDs = {};

    for (let i = 0; i < indices.length; i += 3) {
        for (let k = 0; k < 3; ++k) {
            const i1 = indices[i + offsets[k][0]];
            const i2 = indices[i + offsets[k][1]];

            // check if we already have the line in our lines
            const id = (i1 > i2) ? ((i2 << 16) | i1) : ((i1 << 16) | i2);
            if (lineIDs[id] === undefined) {
                lineIDs[id] = 0;
                lines.push(i1, i2);
            }
        }
    }

    geometry.indices = lines;
    geometry.primitiveMode = PrimitiveMode.LINE_LIST;
    return geometry;
}
