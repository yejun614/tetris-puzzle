
function getRandomShape() {
  const num = Math.floor(Math.random() * 7);
  const shape = blockShapeItems[num];
  
  return blockShapes[shape];
}

const blockRectColors = {
  1: '#85b4ff',
  2: '#0063ff',
  3: '#ffb03b',
  4: '#f7f44a',
  5: '#30cf6c',
  6: '#ba34e3',
  7: '#ed2311',
  9: '#d1d1d1'
}

const blockLineColors = {
  1: '#4e6a96',
  2: '#003282',
  3: '#bf842c',
  4: '#B8860B',
  5: '#208532',
  6: '#561869',
  7: '#7a140b',
  9: '#787878'
}

const blockShapeItems = [
  'l', 'L', 'J', 'O', 'S', 'T', 'Z'
];

const blockShapes = {
  l: [
    [ 1, 1, 1, 1 ],
  ],
  L: [
    [ 2, 0, 0 ],
    [ 2, 2, 2 ],
  ],
  J: [
    [ 0, 0, 3 ],
    [ 3, 3, 3 ]
  ],
  O: [
    [ 4, 4 ],
    [ 4, 4 ],
  ],
  S: [
    [ 0, 5, 5 ],
    [ 5, 5, 0 ],
  ],
  T: [
    [ 0, 6, 0 ],
    [ 6, 6, 6 ],
  ],
  Z: [
    [ 7, 7, 0 ],
    [ 0, 7, 7 ],
  ]
};
