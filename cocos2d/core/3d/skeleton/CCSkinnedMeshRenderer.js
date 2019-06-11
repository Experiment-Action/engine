/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

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
 ****************************************************************************/

const Skeleton = require('./CCSkeleton');
const MeshRenderer = require('../../mesh/CCMeshRenderer');
const RenderFlow = require('../../renderer/render-flow');
const mat4 = cc.vmath.mat4;

let _m4_tmp = mat4.create();

/**
 * !#en
 * Skinned Mesh Renderer
 * !#zh
 * 蒙皮渲染组件
 * @class SkinnedMeshRenderer
 */
let SkinnedMeshRenderer = cc.Class({
    name: 'cc.SkinnedMeshRenderer',
    extends: MeshRenderer,

    editor: CC_EDITOR && {
        menu: 'i18n:MAIN_MENU.component.mesh/Skinned Mesh Renderer',
    },

    ctor () {
        this._jointsData = null;
        this._jointsTexture = null;
        this._joints = [];
        this._dummyNode = new cc.Node();
    },

    properties: {
        _skeleton: Skeleton,
        _rootBone: cc.Node,

        /**
         * !#en
         * Skeleton Asset
         * !#zh
         * 骨骼资源
         * @property {Skeleton} skeleton
         */
        skeleton: {
            get () {
                return this._skeleton;
            },
            set (val) {
                this._skeleton = val;
                this._init();
                this._activateMaterial(true);
            },
            type: Skeleton
        },

        /**
         * !#en
         * Root Bone
         * !#zh
         * 骨骼根节点
         * @property {Node} rootBone
         */
        rootBone: {
            get () {
                return this._rootBone;
            },
            set (val) {
                this._rootBone = val;
                this._init();
            },
            type: cc.Node
        }
    },

    _activateMaterial (force) {
        if (!this._jointsData) {
            this.disableRender();
            return;
        }

        this._super(force);
    },

    __preload () {
        this._init();
    },

    _init () {
        this._model = this._skeleton && this._skeleton.model;

        this._initJoints();
        this._initJointsTexture();
    },

    _calcWorldMatrixToRoot (joint) {
        let worldMatrixToRoot = joint._worldMatrixToRoot;
        if (!worldMatrixToRoot) {
            joint._worldMatrixToRoot = worldMatrixToRoot = cc.mat4();
            joint.getLocalMatrix(worldMatrixToRoot);
        }
        else {
            return;
        }

        let parent = joint.parent;
        if (parent !== this.rootBone) {
            if (!parent._worldMatrixToRoot) {
                this._calcWorldMatrixToRoot(parent);
            }
            mat4.mul(worldMatrixToRoot, parent._worldMatrixToRoot, worldMatrixToRoot);
        }
    },

    _initJoints () {
        let joints = this._joints;
        joints.length = 0;

        if (!this.skeleton || !this.rootBone) return;

        let useJointMatrix = this._useJointMatrix();

        let jointPaths = this.skeleton.jointPaths;
        let rootBone = this.rootBone;
        for (let i = 0; i < jointPaths.length; i++) {
            let joint = cc.find(jointPaths[i], rootBone);
            if (!joint) {
                cc.warn('Can not find joint in root bone [%s] with path [%s]', rootBone.name, jointPaths[i]);
            }

            if (useJointMatrix) {
                joint._renderFlag &= ~RenderFlow.FLAG_CHILDREN;
                this._calcWorldMatrixToRoot(joint);
            }
            
            joints.push(joint);
        }

        if (useJointMatrix) {
            const uniqueBindPoses = this.skeleton.uniqueBindPoses;
            for (let i = 0; i < jointPaths.length; i++) {
                let joint = joints[i];
                if (uniqueBindPoses[i]) {
                    mat4.mul(_m4_tmp, joint._worldMatrixToRoot, uniqueBindPoses[i]);
                    joint._jointMatrix = mat4.array([], _m4_tmp);
                }
                else {
                    joint._jointMatrix = joint._worldMatrixToRoot;
                }
                
            }
        }
    },

    _initJointsTexture () {
        if (!this._skeleton) return;

        let jointCount = this._joints.length;
        let customProperties = this._customProperties;

        let ALLOW_FLOAT_TEXTURE = cc.sys.glExtension('OES_texture_float');
        if (ALLOW_FLOAT_TEXTURE) {
            // set jointsTexture
            let size;
            if (jointCount > 256) {
                size = 64;
            } else if (jointCount > 64) {
                size = 32;
            } else if (jointCount > 16) {
                size = 16;
            } else {
                size = 8;
            }

            this._jointsData = new Float32Array(size * size * 4);

            let texture = this._jointsTexture || new cc.Texture2D();
            texture.initWithData(this._jointsData, cc.Texture2D.PixelFormat.RGBA32F, size, size);

            this._jointsTexture = texture;
            
            customProperties.setProperty('cc_jointsTexture', texture);
            customProperties.setProperty('cc_jointsTextureSize', this._jointsTexture.width);
        }
        else {
            this._jointsData = new Float32Array(jointCount * 16);
            // customProperties.define('_JOINT_MATRICES_SIZE', jointCount);
            customProperties.setProperty('cc_jointMatrices', this._jointsData, true);
        }

        customProperties.define('CC_USE_SKINNING', true);
        customProperties.define('CC_USE_JOINTS_TEXTRUE', ALLOW_FLOAT_TEXTURE);
    },

    _setJointsDataWithArray (iMatrix, matrixArray) {
        let data = this._jointsData;
        data.set(matrixArray, iMatrix * 16);
    },

    _setJointsDataWithMatrix (iMatrix, matrix) {
        this._jointsData.set(matrix.m, 16 * iMatrix);
    },

    _commitJointsData () {
        if (this._jointsTexture) {
            this._jointsTexture.update({ image: this._jointsData });
        }
    },

    _useJointMatrix () {
        return this._model && this._model.precomputeJointMatrix;
    },

    getRenderNode () {
        return this._useJointMatrix() ? this.rootBone : this._dummyNode;
    },

    calcJointMatrix () {
        if (!this.skeleton || !this.rootBone) return;
        const joints = this._joints;
        const bindposes = this.skeleton.bindposes;
        const uniqueBindPoses = this.skeleton.uniqueBindPoses;

        if (this._useJointMatrix()) {
            for (let i = 0; i < joints.length; ++i) {
                let joint = joints[i];
                let jointMatrix = joint._jointMatrix;
    
                if (uniqueBindPoses[i]) {
                    this._setJointsDataWithArray(i, jointMatrix);
                }
                else {
                    mat4.multiply(_m4_tmp, jointMatrix, bindposes[i]);
                    this._setJointsDataWithMatrix(i, _m4_tmp);
                }
            }
        }
        else {
            for (let i = 0; i < joints.length; ++i) {
                let joint = joints[i];
    
                joint._updateWorldMatrix();
                mat4.multiply(_m4_tmp, joint._worldMatrix, bindposes[i]);
                this._setJointsDataWithMatrix(i, _m4_tmp);
            }
        }

        this._commitJointsData();
    }
});

cc.SkinnedMeshRenderer = module.exports = SkinnedMeshRenderer;
