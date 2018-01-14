'use strict';

// modules
const { expect } = require('chai');
const sinon = require('sinon');

// local
const ReApply = require('..');

const randKey = () => `${ Math.random() }`;
const arrOfLen = (len) => [...Array(len)];

describe('ReApply', () => {
  
  let func, handler;
  beforeEach('stub', () => {
    handler = sinon.stub();
    func = ReApply(handler);
  });
  
  it('should be a function', () => {
    expect(ReApply).to.be.a('function');
  });
  
  it('should be a constructor', () => {
    expect(() => new ReApply()).to.not.throw();
  });
  
  it('should return a function', () => {
    expect(func).to.be.a('function');
  });
  
  it('should have functions at every key', () => {
    const func = ReApply(handler);
    expect(func[randKey()]).to.be.a('function');
  });
  
  it('should be infinitely deep', () => {
    func = arrOfLen(50).reduce((func) => func[randKey()], func);
    expect(func).to.be.a('function');
  });
  
  it('should call the handler when any function is called', () => {
    const input = {};
    func[randKey()][randKey()][randKey()](input);
    expect(handler.callCount).to.eql(1);
  });
  
  it('should serialize to a method description', () => {
    expect(`${ func.one.two.three.four.five }`).to.eql('<ReApply.one.two.three.four.five>');
  });
  
  describe('handler', () => {
    
    it('should be called with the method', () => {
      const method = ['a', 'b', 'c'];
      func[method[0]][method[1]][method[2]]();
      expect(handler.args[0][0].method).to.eql(method);
    });
    
    it('should be called with the args', () => {
      const args = [1, 2, 3];
      func[randKey()][randKey()][randKey()](...args);
      expect(handler.args[0][0].args).to.eql(args);
    });
    
    it('should be called with the context', () => {
      func = func[randKey()][randKey()][randKey()];
      const context = { func };
      context.func();
      expect(handler.args[0][0].context).to.equal(context);
    });
    
  });
  
  it('should work with async functions', async () => {
    const expected = {};
    const func = ReApply(async () => expected);
    const result = await func.a.b.c();
    expect(result).to.eql(expected);
  });
  
  it('should propagate errors', () => {
    const error = Error('oops');
    const func = ReApply(() => {
      throw error;
    });
    
    expect(func[randKey()][randKey()][randKey()]).to.throw(error);
  });
  
  describe('ReApply.root', () => {
    
    it('should be a function', () => {
      expect(ReApply.root).to.be.a('function');
    });
    
    it('should return a function', () => {
      expect(ReApply.root()).to.be.a('function');
    });
    
    it('should prepend method parts', () => {
      const root = [randKey(), randKey(), randKey()];
      const tail = [randKey(), randKey(), randKey()];
      
      const func = ReApply.root(root)(handler);
      func[tail[0]][tail[1]][tail[2]]();
      
      expect(handler.args[0][0].method).to.eql([...root, ...tail]);
    });
    
    it('should be curried');
    
  });
  
});
