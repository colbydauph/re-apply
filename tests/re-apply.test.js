'use strict';

// modules
const { expect } = require('chai');
const sinon = require('sinon');

// local
const ReApply = require('..');

const randKey = () => `${ Math.random() }`;
const arrOfLen = (len) => [...Array(len)];

describe('ReApply', () => {
  
  let RA, trap, getTrap;
  beforeEach('stub', () => {
    trap = sinon.stub();
    getTrap = sinon.stub().returns(trap);
    RA = ReApply(getTrap);
  });
  
  it('should be a function', () => {
    expect(ReApply).to.be.a('function');
  });
  
  it('should be a constructor', () => {
    expect(() => new ReApply()).to.not.throw();
  });
  
  it('should return a function', () => {
    expect(RA).to.be.a('function');
  });
  
  it('should have functions at every key', () => {
    const RA = ReApply(getTrap);
    expect(RA[randKey()]).to.be.a('function');
  });
  
  it('should be infinitely deep', () => {
    RA = arrOfLen(50).reduce((RA) => RA[randKey()], RA);
    expect(RA).to.be.a('function');
  });
  
  it('should call the trap when any function is called', () => {
    const input = {};
    RA[randKey()][randKey()][randKey()](input);
    expect(trap.callCount).to.eql(1);
  });
  
  it('should serialize to a method description', () => {
    expect(`${ RA }`).to.eql('<ReApply>');
    expect(`${ RA.one.two.three.four.five }`).to.eql('<ReApply.one.two.three.four.five>');
  });
  
  it('should work with async functions', async () => {
    const expected = {};
    const RA = ReApply(() => async () => expected);
    const result = await RA.a.b.c();
    expect(result).to.eql(expected);
  });
  
  it('should propagate errors', () => {
    const error = Error('oops');
    const RA = ReApply(() => () => {
      throw error;
    });
    
    expect(RA[randKey()][randKey()][randKey()]).to.throw(error);
  });
  
  it('should be immutable', () => {
    expect(() => {
      RA.a = 1;
    }).to.throw(Error, 'Read-only');
    expect(() => {
      delete RA.a;
    }).to.throw(Error, 'Read-only');
  });
  
  it('should return true for all keys with the in operator', () => {
    expect(randKey() in RA).to.eql(true);
  });
  
  describe('getTrap', () => {
    
    it('should be called once for each key (plus once for root)', () => {
      const path = ['a', 'b', 'c'];
      RA[path[0]][path[1]][path[2]]();
      expect(getTrap.callCount).to.eql(path.length + 1);
    });
    
    it('should be called with the method path', () => {
      const path = ['a', 'b', 'c'];
      RA[path[0]][path[1]][path[2]]();
      expect(getTrap.args[3][0]).to.eql(path);
    });
    
  });
  
  describe('trap', () => {
    
    it('should be called once per application', () => {
      const args = [1, 2, 3];
      RA[randKey()][randKey()][randKey()](...args);
      expect(trap.callCount).to.eql(1);
    });
    
    it('should be called with the args', () => {
      const args = [1, 2, 3];
      RA[randKey()][randKey()][randKey()](...args);
      expect(trap.args[0]).to.eql(args);
    });
    
    it('should be called with the context', () => {
      RA = RA[randKey()][randKey()][randKey()];
      const context = { RA };
      context.RA();
      expect(trap.getCall(0).thisValue).to.equal(context);
    });
    
  });
  
  describe('ReApply.path', () => {
    
    it('should be a function', () => {
      expect(ReApply.path).to.be.a('function');
    });
    
    it('should return a function', () => {
      expect(ReApply.path()).to.be.a('function');
    });
    
    it('should prepend path parts', () => {
      const path = [randKey(), randKey(), randKey()];
      const tail = [randKey(), randKey(), randKey()];
      
      const RA = ReApply.path(path)(getTrap);
      RA[tail[0]][tail[1]][tail[2]]();
      
      expect(getTrap.args[4][0]).to.eql([...path, ...tail]);
    });
    
    it('should be curried');
    
  });
  
});
