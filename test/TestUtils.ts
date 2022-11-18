export default class TestUtils {
    /*
   For some reason this allows to wait for nested async code, 
   Seems like it needs to be called *depth* times depending on how many nested async functions are called
  */
    static async waitForAsyncCalls(depth: number): Promise<void> {
        for (let i = 0; i < depth; i++) {
            await Promise.resolve();
        }
    }
}