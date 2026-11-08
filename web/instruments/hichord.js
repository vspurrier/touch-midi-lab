export const hichordProfile = {
  id: 'hichord', name: 'HiChord-inspired',
  chordDefs: [['I','Major',[0,4,7]],['ii','Minor',[2,5,9]],['iii','Minor',[4,7,11]],['IV','Major',[5,9,12]],['V','Major',[7,11,14]],['vi','Minor',[9,12,16]],['vii°','Diminished',[11,14,17]]],
  qualityNotes(index, variant) { const base=this.chordDefs[index][2],minor=this.chordDefs[index][1]==='Minor'; if(variant==='base')return base;if(variant==='flip')return minor?[0,4,7]:[0,3,7];if(variant==='left')return index===6?[0,3,7]:[0,3,6];if(variant==='right')return minor?[0,3,7,10]:[0,4,7,11];if(variant==='nw')return[0,4,8];if(variant==='ne')return[0,4,7,10];if(variant==='sw')return minor?[0,2,7]:[0,4,7,9];if(variant==='s')return[0,5,7];if(variant==='se')return minor?[0,3,7,10,14]:[0,4,7,11,14];return base; },
  joystickVariant(x,y) { if(Math.hypot(x,y)<.22)return'base';const directions=['right','ne','flip','nw','left','sw','s','se'];let sector=Math.round(Math.atan2(-y,x)/(Math.PI/4));if(sector<0)sector+=8;return directions[sector%8]; }
};
