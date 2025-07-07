import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("test individual counters", () => {
  it("retrieves the default count for a new user", () => {
    const countResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address2)],
      address1,
    );
    expect(countResponse.result).toBeUint(0);
  });

  it("increments the count for a user", () => {
    const incrementResponse = simnet.callPublicFn(
      "counter",
      "count-up",
      [],
      address1,
    );
    expect(incrementResponse.result).toBeOk(Cl.bool(true));

    // Retrieve the updated count for address1
    const updatedCountResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address1)],
      address1,
    );
    expect(updatedCountResponse.result).toBeUint(1);
  });
  it("increments the count for a user multiple times", () => {
    // Call the count-up function for address2 twice
    let incrementResponse = simnet.callPublicFn(
      "counter",
      "count-up",
      [],
      address2,
    );
    expect(incrementResponse.result).toBeOk(Cl.bool(true));

    incrementResponse = simnet.callPublicFn(
      "counter",
      "count-up",
      [],
      address2,
    );
    expect(incrementResponse.result).toBeOk(Cl.bool(true));

    // Retrieve the updated count for address2
    const updatedCountResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address2)],
      address1,
    );
    expect(updatedCountResponse.result).toBeUint(2);
  });

  it("decrements the count for a user", () => {
    // First increment the count
    simnet.callPublicFn("counter", "count-up", [], address1);
    simnet.callPublicFn("counter", "count-up", [], address1);
    
    // Now decrement
    const decrementResponse = simnet.callPublicFn(
      "counter",
      "count-down",
      [],
      address1,
    );
    expect(decrementResponse.result).toBeOk(Cl.bool(true));

    // Check the count is now 1
    const countResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address1)],
      address1,
    );
    expect(countResponse.result).toBeUint(1);
  });

  it("prevents decrementing below zero", () => {
    // Try to decrement when count is 0
    const decrementResponse = simnet.callPublicFn(
      "counter",
      "count-down",
      [],
      address2,
    );
    expect(decrementResponse.result).toBeErr(Cl.uint(1));

    // Count should still be 0
    const countResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address2)],
      address1,
    );
    expect(countResponse.result).toBeUint(0);
  });

  it("resets the count for a user to zero", () => {
    // First increment the count
    simnet.callPublicFn("counter", "count-up", [], address1);
    simnet.callPublicFn("counter", "count-up", [], address1);
    simnet.callPublicFn("counter", "count-up", [], address1);
    
    // Verify count is 3
    let countResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address1)],
      address1,
    );
    expect(countResponse.result).toBeUint(3);

    // Now reset
    const resetResponse = simnet.callPublicFn(
      "counter",
      "reset-count",
      [],
      address1,
    );
    expect(resetResponse.result).toBeOk(Cl.bool(true));

    // Check the count is now 0
    countResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address1)],
      address1,
    );
    expect(countResponse.result).toBeUint(0);
  });

  it("sets the count to a custom value", () => {
    // Set count to 42
    const setResponse = simnet.callPublicFn(
      "counter",
      "set-count",
      [Cl.uint(42)],
      address1,
    );
    expect(setResponse.result).toBeOk(Cl.bool(true));

    // Check the count is now 42
    const countResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address1)],
      address1,
    );
    expect(countResponse.result).toBeUint(42);
  });

  it("tracks global total across all users", () => {
    // Initial global total should be 0
    let globalTotal = simnet.callReadOnlyFn(
      "counter",
      "get-global-total",
      [],
      address1,
    );
    expect(globalTotal.result).toBeUint(0);

    // Increment for address1
    simnet.callPublicFn("counter", "count-up", [], address1);
    simnet.callPublicFn("counter", "count-up", [], address1);
    
    // Increment for address2
    simnet.callPublicFn("counter", "count-up", [], address2);

    // Global total should be 3
    globalTotal = simnet.callReadOnlyFn(
      "counter",
      "get-global-total",
      [],
      address1,
    );
    expect(globalTotal.result).toBeUint(3);
  });

  it("increments count by custom amount", () => {
    // Increment by 5
    const incrementResponse = simnet.callPublicFn(
      "counter",
      "count-up-by",
      [Cl.uint(5)],
      address1,
    );
    expect(incrementResponse.result).toBeOk(Cl.bool(true));

    // Check the count is now 5
    const countResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address1)],
      address1,
    );
    expect(countResponse.result).toBeUint(5);
  });

  it("decrements count by custom amount", () => {
    // First set count to 10
    simnet.callPublicFn("counter", "set-count", [Cl.uint(10)], address1);
    
    // Decrement by 3
    const decrementResponse = simnet.callPublicFn(
      "counter",
      "count-down-by",
      [Cl.uint(3)],
      address1,
    );
    expect(decrementResponse.result).toBeOk(Cl.bool(true));

    // Check the count is now 7
    const countResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address1)],
      address1,
    );
    expect(countResponse.result).toBeUint(7);
  });

  it("prevents decrementing by amount larger than current count", () => {
    // Set count to 3
    simnet.callPublicFn("counter", "set-count", [Cl.uint(3)], address1);
    
    // Try to decrement by 5
    const decrementResponse = simnet.callPublicFn(
      "counter",
      "count-down-by",
      [Cl.uint(5)],
      address1,
    );
    expect(decrementResponse.result).toBeErr(Cl.uint(2));

    // Count should still be 3
    const countResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address1)],
      address1,
    );
    expect(countResponse.result).toBeUint(3);
  });
});
