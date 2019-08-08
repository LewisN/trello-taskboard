const teams = {
  'Unagi': [
    'carrieuc',
    'alexptuc',
    'sambuc',
    'lewisuc',
    'gracedean6',
    'swizelfernandes',
  ],
  'Noodle': [
    'danuc',
    'elizabyrne1',
    'callummcstay1',
    'joegill19',
    'sarahuc',
    'meganryderr',
  ],
  'Wolfpack': [
    'ashleighuc',
    'emilyuc',
    'hazeluc',
    'rebeccauc',
    'radekloucka',
    'fayeuc',
  ],
  'Podacity': [
    'daviduc',
    'halimasuc',
    'oliviauc',
    'robertuc',
    'joshuc',
    'fayeuc',
  ],
  'Leadership Team': [
    'markleach21',
    'ryanuc',
    'bethuc',
    'llarageddes2',
    'adamuc',
    'damianuc',
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
    'damianuc',
    'lewisuc',
    'joshuc',
    'rebeccauc',
    'sarahuc',
    'michele55205618',
    'maxuc',
  ],  
  'Analytics': [
    'adamuc',
    'robertuc',
    'joegill19',
    'gracedean6',
    'radekloucka',
  ],
  'Design': [
    'fayeuc',
    'meganryderr',
    'swizelfernandes',
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
