import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import Home from "@/components/Home.vue";

describe("Home.vue", () => {
  it("Should have h1 text equal to Carousel", () => {
    const msg = "Carousel";
    const wrapper = shallowMount(Home);
    expect(wrapper.find("h1").text()).equal(msg);
  });
});
