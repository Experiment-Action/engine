#pragma once

#include "MTLGPUObjects.h"
#include <tuple>

#import <Metal/MTLRenderPipeline.h>
#import <Metal/MTLDepthStencil.h>

namespace cc {
namespace gfx {

class CCMTLPipelineState : public PipelineState {
public:
    CCMTLPipelineState(Device *device);
    virtual ~CCMTLPipelineState();

    virtual bool initialize(const PipelineStateInfo &info) override;
    virtual void destroy() override;

    CC_INLINE CCMTLGPUPipelineState *getGPUPipelineState() const { return _GPUPipelieState; }

private:
    bool createMTLDepthStencilState();
    bool createGPUPipelineState();
    bool createMTLRenderPipelineState();
    void setVertexDescriptor(MTLRenderPipelineDescriptor *);
    void setMTLFunctions(MTLRenderPipelineDescriptor *);
    void setFormats(MTLRenderPipelineDescriptor *);
    void setBlendStates(MTLRenderPipelineDescriptor *);
    bool createMTLRenderPipeline(MTLRenderPipelineDescriptor *);

private:
    id<MTLRenderPipelineState> _mtlRenderPipelineState = nil;
    id<MTLDepthStencilState> _mtlDepthStencilState = nil;
    CCMTLGPUPipelineState *_GPUPipelieState = nullptr;
};

} // namespace gfx
} // namespace cc
