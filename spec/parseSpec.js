const parse = require('../src/parse');

describe('parse', () => {
  describe('stripTwitterEntities', () => {
    it('should strip hashtags and urls correctly', () => {
      const status = {
        text: "_=T(' #d3js #d3js '.split(''));_.e.t(d=&gt;d);_.a(tr,(d,i)=&gt;sc(5)+' '+ts((i-6)*8,s((t+i*40)*.004)*10)); https://t.co/YIG2Q2bTJ0",
        entities: {
          urls: [
            { indices: [ 107, 130 ] }
          ],
          hashtags: [
            { indices: [ 6, 11 ] },
            { indices: [ 12, 17 ] }
          ],
          user_mentions: []
        }
      };
      const expected = "_=T('   '.split(''));_.e.t(d=&gt;d);_.a(tr,(d,i)=&gt;sc(5)+' '+ts((i-6)*8,s((t+i*40)*.004)*10)); ";
      expect(parse.stripTwitterEntities(status)).toEqual(expected);
    })
  })
})
