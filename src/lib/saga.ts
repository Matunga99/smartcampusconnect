
export interface SagaStep {
    id: string;
    action: () => Promise<any>;
    compensate: () => Promise<void>;
}

export const runSaga = async (steps: SagaStep[]) => {
    const executed: SagaStep[] = [];
    try {
        for (const step of steps) {
            console.log(`[SAGA] Executing: ${step.id}`);
            await step.action();
            executed.push(step);
        }
    } catch (error) {
        console.error(`[SAGA] Error, compensating...`, error);
        for (const step of executed.reverse()) {
            console.log(`[SAGA] Compensating: ${step.id}`);
            await step.compensate();
        }
        throw error;
    }
};
