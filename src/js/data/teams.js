const teams = {
  'Pod Avengers': [
    'danuc',
    'elizabyrne1',
    'hazeluc', 'oliviauc',
    'sarahuc',
    'rebeccauc',
  ],
  'Pod Skywalker': [
    'carrieuc',
    'alexptuc',
    'sambuc',
    'scottuc',
    'bilaluc',
  ],
  'Leadership Team': [
    'markleach21',
    'daviduc',
    'ryanuc',
    'bethuc',
    'llarageddes2',
    'adamuc',
  ],
  'Strategy': [
    'carrieuc',
    'danuc',
  ],
  'Account Management': [
    'emilyuc',
    'alexptuc',
    'elizabyrne1',
  ],
  'Research': [
    'llarageddes2',
    'hazeluc',
    'oliviauc',
    'sambuc',
    'carrieuc',
    'callummcstay1',
    'halimasuc',
    'sarahluc',
  ],
  'Development': [
    'ryanuc',
    'lewisuc',
    'damianuc',
    'joshuc',
    'rebeccauc',
    'sarahuc',
    'scottuc',
    'bilaluc',
  ], 
  'QA': [
    'maxuc',
  ], 
  'Analytics': [
    'adamuc',
    'robertuc',
    'joegill19',
    'amy31029358',
    'gracedean6',
  ],
  'Operations': [
    'bethuc',
  ],
  'Design': [
    'fayeuc',
    'meganryderr',
    'swizelfernandes',
  ], 
  'Directors': [
    'daviduc',
    'ryanuc',
  ],
  'User Test': [
    'prestonuc',
  ],
  'Podless': [
    'daviduc',
    'ryanuc',
    'adamuc',
    'lewisuc',
    'bethuc',
    'maxuc',
    'fayeuc',
  ],
};

// Combine teams to create one with all users
teams.All = (() => {
  let all = [];
  Object.values(teams).forEach((value) => {
    all = all.concat(value);
  });

  // Remove duplicate names
  all = all.filter(function(val, idx, arr) {
      return arr.indexOf(val) === idx;
  });
  return all;
})();

export default teams;
