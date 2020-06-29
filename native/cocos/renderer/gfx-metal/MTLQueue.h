#pragma once

namespace cc {
namespace gfx {

class CCMTLQueue : public Queue {
    friend class CCMTLDevice;

public:
    CCMTLQueue(Device *device);
    ~CCMTLQueue();

    virtual bool initialize(const QueueInfo &info) override;
    virtual void destroy() override;
    virtual void submit(const vector<CommandBuffer *> &cmdBuffs, Fence *fence) override;

private:
    uint _numDrawCalls = 0;
    uint _numInstances = 0;
    uint _numTriangles = 0;
};

} // namespace gfx
} // namespace cc
