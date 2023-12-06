export function register() {
  //   const gen = asyncGenerator();
  //   processGenerator(gen);
}

// function* asyncGenerator() {
//   yield new Promise((resolve) => setTimeout(() => resolve("Result 1"), 1000));
//   yield new Promise((resolve) => setTimeout(() => resolve("Result 1"), 1000));
//   yield new Promise((resolve) => setTimeout(() => resolve("Result 1"), 1000));
//   yield new Promise((resolve) => setTimeout(() => resolve("Result 1"), 1000));
//   yield new Promise((resolve) => setTimeout(() => resolve("Result 1"), 1000));
//   yield new Promise((resolve) => setTimeout(() => resolve("Result 1"), 1000));
//   yield new Promise((resolve) => setTimeout(() => resolve("Result 1"), 1000));
//   yield new Promise((resolve) => setTimeout(() => resolve("Result 1"), 1000));

//   // Add more yields as needed
// }

// // Function to process each yielded promise without blocking
// const processGenerator = async (gen) => {
//   let result = gen.next();
//   (async () => {
//     while (result.done) {
//       result.value.then(console.log);
//       const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//       await wait(1000);

//       // Handle the promise without blocking
//       result = gen.next();
//     }
//   })();
// };
