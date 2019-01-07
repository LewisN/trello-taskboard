const teams = {
  'Pod Avengers': [
    'danuc',
    'elizabyrne1',
    'hazeluc',
    'oliviauc',
    'callummcstay1',
    'damianuc',
    'rebeccauc',
    'sarahuc',
    'robertuc',
    'joegill19',
    'meganryderr',
  ],
  'Pod Skywalker': [
    'carrieuc',
    'halimasuc',
    'alexptuc',
    'sambuc',
    'sarahuc',
    'joshuc',
    'michele55205618',
    'bilaluc',
    'gracedean6',
    'amy31029358',
    'swizelfernandes',
    'fayeuc',
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
    'halimasuc',
  ],
  'Account Management & Operations': [
    'bethuc',
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
    'bilaluc',
    'michele55205618'
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
  'Design': [
    'fayeuc',
    'meganryderr',
    'swizelfernandes',
  ], 
  'User Test': [],
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
