/****************************************************************************
 Copyright (c) 2016 Chukong Technologies Inc.
 Copyright (c) 2017-2022 Xiamen Yaji Software Co., Ltd.

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

#pragma once

#include "Object.h"
#include "PrivateObject.h"
#include "Value.h"

namespace se {

class Object;

/**
     *  State represents an environment while a function or an accesstor is invoked from JavaScript.
     */
class State final {
public:
    /**
         *  @brief Gets void* pointer of `this` object's private data.
         *  @return A void* pointer of `this` object's private data.
         */
    inline void *nativeThisObject() const {
        return _thisObject != nullptr ? _thisObject->getPrivateData() : nullptr;
    }

    /**
         *  @brief Gets the arguments of native binding functions or accesstors.
         *  @return The arguments of native binding functions or accesstors.
         */
    inline const ValueArray &args() const {
        return _args != nullptr ? (*_args) : EmptyValueArray;
    }

    /**
         *  @brief Gets the JavaScript `this` object wrapped in se::Object.
         *  @return The JavaScript `this` object wrapped in se::Object.
         */
    inline Object *thisObject() const {
        return _thisObject;
    }

    /**
         *  @brief Gets the return value reference. Used for setting return value for a function.
         *  @return The return value reference.
         */
    inline const Value &rval() const {
        return _retVal;
    }

    inline Value &rval() {
        return _retVal;
    }

    // Private API used in wrapper
    /**
         *  @brief
         *  @param[in]
         *  @return
         */
    ~State();

    explicit State(Object *thisObject);
    State(Object *thisObject, const ValueArray &args);

private:
    // Disable copy/move constructor, copy/move assigment
    State(const State &);
    State(State &&) noexcept;
    State &operator=(const State &);
    State &operator=(State &&) noexcept;

    Object *_thisObject{nullptr};     //weak ref
    const ValueArray *_args{nullptr}; //weak ref
    Value _retVal;                    //weak ref
};
} // namespace se
