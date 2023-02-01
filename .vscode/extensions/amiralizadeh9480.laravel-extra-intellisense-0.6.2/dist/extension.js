/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/php-parser/src/ast.js":
/*!********************************************!*\
  !*** ./node_modules/php-parser/src/ast.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Location = __webpack_require__(/*! ./ast/location */ "./node_modules/php-parser/src/ast/location.js");
const Position = __webpack_require__(/*! ./ast/position */ "./node_modules/php-parser/src/ast/position.js");

/**
 * ## Class hierarchy
 *
 * - [Location](#location)
 * - [Position](#position)
 * - [Node](#node)
 *   - [Noop](#noop)
 *   - [NullKeyword](#nullkeyword)
 *   - [StaticVariable](#staticvariable)
 *   - [EncapsedPart](#encapsedpart)
 *   - [Constant](#constant)
 *   - [Identifier](#identifier)
 *   - [Reference](#reference)
 *     - [TypeReference](#typereference)
 *     - [ParentReference](#parentreference)
 *     - [StaticReference](#staticreference)
 *     - [SelfReference](#selfreference)
 *     - [Name](#name)
 *   - [TraitUse](#traituse)
 *   - [TraitAlias](#traitalias)
 *   - [TraitPrecedence](#traitprecedence)
 *   - [Comment](#comment)
 *     - [CommentLine](#commentline)
 *     - [CommentBlock](#commentblock)
 *   - [Error](#error)
 *   - [Expression](#expression)
 *     - [Entry](#entry)
 *     - [ArrowFunc](#arrowfunc)
 *     - [Closure](#closure)
 *     - [ByRef](#byref)
 *     - [Silent](#silent)
 *     - [RetIf](#retif)
 *     - [New](#new)
 *     - [Include](#include)
 *     - [Call](#call)
 *     - [Eval](#eval)
 *     - [Exit](#exit)
 *     - [Clone](#clone)
 *     - [Assign](#assign)
 *     - [AssignRef](#assignref)
 *     - [Array](#array)
 *     - [List](#list)
 *     - [Variable](#variable)
 *     - [Variadic](#variadic)
 *     - [Yield](#yield)
 *     - [YieldFrom](#yieldfrom)
 *     - [Print](#print)
 *     - [Isset](#isset)
 *     - [Empty](#empty)
 *     - [Lookup](#lookup)
 *       - [PropertyLookup](#propertylookup)
 *       - [StaticLookup](#staticlookup)
 *       - [OffsetLookup](#offsetlookup)
 *     - [Operation](#operation)
 *       - [Pre](#pre)
 *       - [Post](#post)
 *       - [Bin](#bin)
 *       - [Unary](#unary)
 *       - [Cast](#cast)
 *     - [Literal](#literal)
 *       - [Boolean](#boolean)
 *       - [String](#string)
 *       - [Number](#number)
 *       - [Inline](#inline)
 *       - [Magic](#magic)
 *       - [Nowdoc](#nowdoc)
 *       - [Encapsed](#encapsed)
 *   - [Statement](#statement)
 *     - [ConstantStatement](#constantstatement)
 *       - [ClassConstant](#classconstant)
 *     - [Return](#return)
 *     - [Label](#label)
 *     - [Continue](#continue)
 *     - [Case](#case)
 *     - [Break](#break)
 *     - [Echo](#echo)
 *     - [Unset](#unset)
 *     - [Halt](#halt)
 *     - [Declare](#declare)
 *     - [Global](#global)
 *     - [Static](#static)
 *     - [If](#if)
 *     - [Do](#do)
 *     - [While](#while)
 *     - [For](#for)
 *     - [Foreach](#foreach)
 *     - [Switch](#switch)
 *     - [Goto](#goto)
 *     - [Try](#try)
 *     - [Catch](#catch)
 *     - [Throw](#throw)
 *     - [UseGroup](#usegroup)
 *     - [UseItem](#useitem)
 *     - [Block](#block)
 *       - [Program](#program)
 *       - [Namespace](#namespace)
 *     - [PropertyStatement](#propertystatement)
 *     - [Property](#property)
 *     - [Declaration](#declaration)
 *       - [Class](#class)
 *       - [Interface](#interface)
 *       - [Trait](#trait)
 *       - [Function](#function)
 *         - [Method](#method)
 *       - [Parameter](#parameter)
 * ---
 */

/**
 * The AST builder class
 * @constructor AST
 * @tutorial AST
 * @property {Boolean} withPositions - Should locate any node (by default false)
 * @property {Boolean} withSource - Should extract the node original code (by default false)
 */
const AST = function (withPositions, withSource) {
  this.withPositions = withPositions;
  this.withSource = withSource;
};

/**
 * Create a position node from specified parser
 * including it's lexer current state
 * @param {Parser}
 * @return {Position}
 * @private
 */
AST.prototype.position = function (parser) {
  return new Position(
    parser.lexer.yylloc.first_line,
    parser.lexer.yylloc.first_column,
    parser.lexer.yylloc.first_offset
  );
};

// operators in ascending order of precedence
AST.precedence = {};
[
  ["or"],
  ["xor"],
  ["and"],
  ["="],
  ["?"],
  ["??"],
  ["||"],
  ["&&"],
  ["|"],
  ["^"],
  ["&"],
  ["==", "!=", "===", "!==", /* '<>', */ "<=>"],
  ["<", "<=", ">", ">="],
  ["<<", ">>"],
  ["+", "-", "."],
  ["*", "/", "%"],
  ["!"],
  ["instanceof"],
  ["cast", "silent"],
  ["**"],
  // TODO: [ (array)
  // TODO: clone, new
].forEach(function (list, index) {
  list.forEach(function (operator) {
    AST.precedence[operator] = index + 1;
  });
});

AST.prototype.isRightAssociative = function (operator) {
  return operator === "**" || operator === "??";
};

/**
 * Change parent node informations after swapping childs
 */
AST.prototype.swapLocations = function (target, first, last, parser) {
  if (this.withPositions) {
    target.loc.start = first.loc.start;
    target.loc.end = last.loc.end;
    if (this.withSource) {
      target.loc.source = parser.lexer._input.substring(
        target.loc.start.offset,
        target.loc.end.offset
      );
    }
  }
};

/**
 * Includes locations from first & last into the target
 */
AST.prototype.resolveLocations = function (target, first, last, parser) {
  if (this.withPositions) {
    if (target.loc.start.offset > first.loc.start.offset) {
      target.loc.start = first.loc.start;
    }
    if (target.loc.end.offset < last.loc.end.offset) {
      target.loc.end = last.loc.end;
    }
    if (this.withSource) {
      target.loc.source = parser.lexer._input.substring(
        target.loc.start.offset,
        target.loc.end.offset
      );
    }
  }
};

/**
 * Check and fix precence, by default using right
 */
AST.prototype.resolvePrecedence = function (result, parser) {
  let buffer, lLevel, rLevel;
  // handling precendence
  if (result.kind === "call") {
    // including what argument into location
    this.resolveLocations(result, result.what, result, parser);
  } else if (
    result.kind === "propertylookup" ||
    result.kind === "staticlookup" ||
    (result.kind === "offsetlookup" && result.offset)
  ) {
    // including what argument into location
    this.resolveLocations(result, result.what, result.offset, parser);
  } else if (result.kind === "bin") {
    if (result.right && !result.right.parenthesizedExpression) {
      if (result.right.kind === "bin") {
        lLevel = AST.precedence[result.type];
        rLevel = AST.precedence[result.right.type];
        if (
          lLevel &&
          rLevel &&
          rLevel <= lLevel &&
          (result.type !== result.right.type ||
            !this.isRightAssociative(result.type))
        ) {
          // https://github.com/glayzzle/php-parser/issues/79
          // shift precedence
          buffer = result.right;
          result.right = result.right.left;
          this.swapLocations(result, result.left, result.right, parser);
          buffer.left = this.resolvePrecedence(result, parser);
          this.swapLocations(buffer, buffer.left, buffer.right, parser);
          result = buffer;
        }
      } else if (result.right.kind === "retif") {
        lLevel = AST.precedence[result.type];
        rLevel = AST.precedence["?"];
        if (lLevel && rLevel && rLevel <= lLevel) {
          buffer = result.right;
          result.right = result.right.test;
          this.swapLocations(result, result.left, result.right, parser);
          buffer.test = this.resolvePrecedence(result, parser);
          this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
          result = buffer;
        }
      }
    }
  } else if (
    (result.kind === "silent" || result.kind === "cast") &&
    result.expr &&
    !result.expr.parenthesizedExpression
  ) {
    // https://github.com/glayzzle/php-parser/issues/172
    if (result.expr.kind === "bin") {
      buffer = result.expr;
      result.expr = result.expr.left;
      this.swapLocations(result, result, result.expr, parser);
      buffer.left = this.resolvePrecedence(result, parser);
      this.swapLocations(buffer, buffer.left, buffer.right, parser);
      result = buffer;
    } else if (result.expr.kind === "retif") {
      buffer = result.expr;
      result.expr = result.expr.test;
      this.swapLocations(result, result, result.expr, parser);
      buffer.test = this.resolvePrecedence(result, parser);
      this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
      result = buffer;
    }
  } else if (result.kind === "unary") {
    // https://github.com/glayzzle/php-parser/issues/75
    if (result.what && !result.what.parenthesizedExpression) {
      // unary precedence is allways lower
      if (result.what.kind === "bin") {
        buffer = result.what;
        result.what = result.what.left;
        this.swapLocations(result, result, result.what, parser);
        buffer.left = this.resolvePrecedence(result, parser);
        this.swapLocations(buffer, buffer.left, buffer.right, parser);
        result = buffer;
      } else if (result.what.kind === "retif") {
        buffer = result.what;
        result.what = result.what.test;
        this.swapLocations(result, result, result.what, parser);
        buffer.test = this.resolvePrecedence(result, parser);
        this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
        result = buffer;
      }
    }
  } else if (result.kind === "retif") {
    // https://github.com/glayzzle/php-parser/issues/77
    if (
      result.falseExpr &&
      result.falseExpr.kind === "retif" &&
      !result.falseExpr.parenthesizedExpression
    ) {
      buffer = result.falseExpr;
      result.falseExpr = buffer.test;
      this.swapLocations(result, result.test, result.falseExpr, parser);
      buffer.test = this.resolvePrecedence(result, parser);
      this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
      result = buffer;
    }
  } else if (result.kind === "assign") {
    // https://github.com/glayzzle/php-parser/issues/81
    if (
      result.right &&
      result.right.kind === "bin" &&
      !result.right.parenthesizedExpression
    ) {
      lLevel = AST.precedence["="];
      rLevel = AST.precedence[result.right.type];
      // only shifts with and, xor, or
      if (lLevel && rLevel && rLevel < lLevel) {
        buffer = result.right;
        result.right = result.right.left;
        buffer.left = result;
        this.swapLocations(buffer, buffer.left, result.right, parser);
        result = buffer;
      }
    }
  } else if (result.kind === "expressionstatement") {
    this.swapLocations(result, result.expression, result, parser);
  }
  return result;
};

/**
 * Prepares an AST node
 * @param {String|null} kind - Defines the node type
 * (if null, the kind must be passed at the function call)
 * @param {Parser} parser - The parser instance (use for extracting locations)
 * @return {Function}
 */
AST.prototype.prepare = function (kind, docs, parser) {
  let start = null;
  if (this.withPositions || this.withSource) {
    start = this.position(parser);
  }
  const self = this;
  // returns the node
  const result = function () {
    let location = null;
    const args = Array.prototype.slice.call(arguments);
    args.push(docs);
    if (self.withPositions || self.withSource) {
      let src = null;
      if (self.withSource) {
        src = parser.lexer._input.substring(start.offset, parser.prev[2]);
      }
      // if with source, need location on swapLocations function
      location = new Location(
        src,
        start,
        new Position(parser.prev[0], parser.prev[1], parser.prev[2])
      );
      // last argument is allways the location
      args.push(location);
    }
    // handle lazy kind definitions
    if (!kind) {
      kind = args.shift();
    }
    // build the object
    const node = self[kind];
    if (typeof node !== "function") {
      throw new Error('Undefined node "' + kind + '"');
    }
    const astNode = Object.create(node.prototype);
    node.apply(astNode, args);
    result.instance = astNode;
    if (result.trailingComments) {
      // buffer of trailingComments
      astNode.trailingComments = result.trailingComments;
    }
    if (typeof result.postBuild === "function") {
      result.postBuild(astNode);
    }
    if (parser.debug) {
      delete AST.stack[result.stackUid];
    }
    return self.resolvePrecedence(astNode, parser);
  };
  if (parser.debug) {
    if (!AST.stack) {
      AST.stack = {};
      AST.stackUid = 1;
    }
    AST.stack[++AST.stackUid] = {
      position: start,
      stack: new Error().stack.split("\n").slice(3, 5),
    };
    result.stackUid = AST.stackUid;
  }

  /**
   * Sets a list of trailing comments
   * @param {*} docs
   */
  result.setTrailingComments = function (docs) {
    if (result.instance) {
      // already created
      result.instance.setTrailingComments(docs);
    } else {
      result.trailingComments = docs;
    }
  };

  /**
   * Release a node without using it on the AST
   */
  result.destroy = function (target) {
    if (docs) {
      // release current docs stack
      if (target) {
        if (!target.leadingComments) {
          target.leadingComments = docs;
        } else {
          target.leadingComments = docs.concat(target.leadingComments);
        }
      } else {
        parser._docIndex = parser._docs.length - docs.length;
      }
    }
    if (parser.debug) {
      delete AST.stack[result.stackUid];
    }
  };
  return result;
};

AST.prototype.checkNodes = function () {
  const errors = [];
  for (const k in AST.stack) {
    if (AST.stack.hasOwnProperty(k)) {
      errors.push(AST.stack[k]);
    }
  }
  AST.stack = {};
  return errors;
};

// Define all AST nodes
[
  __webpack_require__(/*! ./ast/array */ "./node_modules/php-parser/src/ast/array.js"),
  __webpack_require__(/*! ./ast/arrowfunc */ "./node_modules/php-parser/src/ast/arrowfunc.js"),
  __webpack_require__(/*! ./ast/assign */ "./node_modules/php-parser/src/ast/assign.js"),
  __webpack_require__(/*! ./ast/assignref */ "./node_modules/php-parser/src/ast/assignref.js"),
  __webpack_require__(/*! ./ast/bin */ "./node_modules/php-parser/src/ast/bin.js"),
  __webpack_require__(/*! ./ast/block */ "./node_modules/php-parser/src/ast/block.js"),
  __webpack_require__(/*! ./ast/boolean */ "./node_modules/php-parser/src/ast/boolean.js"),
  __webpack_require__(/*! ./ast/break */ "./node_modules/php-parser/src/ast/break.js"),
  __webpack_require__(/*! ./ast/byref */ "./node_modules/php-parser/src/ast/byref.js"),
  __webpack_require__(/*! ./ast/call */ "./node_modules/php-parser/src/ast/call.js"),
  __webpack_require__(/*! ./ast/case */ "./node_modules/php-parser/src/ast/case.js"),
  __webpack_require__(/*! ./ast/cast */ "./node_modules/php-parser/src/ast/cast.js"),
  __webpack_require__(/*! ./ast/catch */ "./node_modules/php-parser/src/ast/catch.js"),
  __webpack_require__(/*! ./ast/class */ "./node_modules/php-parser/src/ast/class.js"),
  __webpack_require__(/*! ./ast/classconstant */ "./node_modules/php-parser/src/ast/classconstant.js"),
  __webpack_require__(/*! ./ast/clone */ "./node_modules/php-parser/src/ast/clone.js"),
  __webpack_require__(/*! ./ast/closure */ "./node_modules/php-parser/src/ast/closure.js"),
  __webpack_require__(/*! ./ast/comment */ "./node_modules/php-parser/src/ast/comment.js"),
  __webpack_require__(/*! ./ast/commentblock */ "./node_modules/php-parser/src/ast/commentblock.js"),
  __webpack_require__(/*! ./ast/commentline */ "./node_modules/php-parser/src/ast/commentline.js"),
  __webpack_require__(/*! ./ast/constant */ "./node_modules/php-parser/src/ast/constant.js"),
  __webpack_require__(/*! ./ast/constantstatement */ "./node_modules/php-parser/src/ast/constantstatement.js"),
  __webpack_require__(/*! ./ast/continue */ "./node_modules/php-parser/src/ast/continue.js"),
  __webpack_require__(/*! ./ast/declaration */ "./node_modules/php-parser/src/ast/declaration.js"),
  __webpack_require__(/*! ./ast/declare */ "./node_modules/php-parser/src/ast/declare.js"),
  __webpack_require__(/*! ./ast/declaredirective */ "./node_modules/php-parser/src/ast/declaredirective.js"),
  __webpack_require__(/*! ./ast/do */ "./node_modules/php-parser/src/ast/do.js"),
  __webpack_require__(/*! ./ast/echo */ "./node_modules/php-parser/src/ast/echo.js"),
  __webpack_require__(/*! ./ast/empty */ "./node_modules/php-parser/src/ast/empty.js"),
  __webpack_require__(/*! ./ast/encapsed */ "./node_modules/php-parser/src/ast/encapsed.js"),
  __webpack_require__(/*! ./ast/encapsedpart */ "./node_modules/php-parser/src/ast/encapsedpart.js"),
  __webpack_require__(/*! ./ast/entry */ "./node_modules/php-parser/src/ast/entry.js"),
  __webpack_require__(/*! ./ast/error */ "./node_modules/php-parser/src/ast/error.js"),
  __webpack_require__(/*! ./ast/eval */ "./node_modules/php-parser/src/ast/eval.js"),
  __webpack_require__(/*! ./ast/exit */ "./node_modules/php-parser/src/ast/exit.js"),
  __webpack_require__(/*! ./ast/expression */ "./node_modules/php-parser/src/ast/expression.js"),
  __webpack_require__(/*! ./ast/expressionstatement */ "./node_modules/php-parser/src/ast/expressionstatement.js"),
  __webpack_require__(/*! ./ast/for */ "./node_modules/php-parser/src/ast/for.js"),
  __webpack_require__(/*! ./ast/foreach */ "./node_modules/php-parser/src/ast/foreach.js"),
  __webpack_require__(/*! ./ast/function */ "./node_modules/php-parser/src/ast/function.js"),
  __webpack_require__(/*! ./ast/global */ "./node_modules/php-parser/src/ast/global.js"),
  __webpack_require__(/*! ./ast/goto */ "./node_modules/php-parser/src/ast/goto.js"),
  __webpack_require__(/*! ./ast/halt */ "./node_modules/php-parser/src/ast/halt.js"),
  __webpack_require__(/*! ./ast/identifier */ "./node_modules/php-parser/src/ast/identifier.js"),
  __webpack_require__(/*! ./ast/if */ "./node_modules/php-parser/src/ast/if.js"),
  __webpack_require__(/*! ./ast/include */ "./node_modules/php-parser/src/ast/include.js"),
  __webpack_require__(/*! ./ast/inline */ "./node_modules/php-parser/src/ast/inline.js"),
  __webpack_require__(/*! ./ast/interface */ "./node_modules/php-parser/src/ast/interface.js"),
  __webpack_require__(/*! ./ast/isset */ "./node_modules/php-parser/src/ast/isset.js"),
  __webpack_require__(/*! ./ast/label */ "./node_modules/php-parser/src/ast/label.js"),
  __webpack_require__(/*! ./ast/list */ "./node_modules/php-parser/src/ast/list.js"),
  __webpack_require__(/*! ./ast/literal */ "./node_modules/php-parser/src/ast/literal.js"),
  __webpack_require__(/*! ./ast/lookup */ "./node_modules/php-parser/src/ast/lookup.js"),
  __webpack_require__(/*! ./ast/magic */ "./node_modules/php-parser/src/ast/magic.js"),
  __webpack_require__(/*! ./ast/method */ "./node_modules/php-parser/src/ast/method.js"),
  __webpack_require__(/*! ./ast/name */ "./node_modules/php-parser/src/ast/name.js"),
  __webpack_require__(/*! ./ast/namespace */ "./node_modules/php-parser/src/ast/namespace.js"),
  __webpack_require__(/*! ./ast/new */ "./node_modules/php-parser/src/ast/new.js"),
  __webpack_require__(/*! ./ast/node */ "./node_modules/php-parser/src/ast/node.js"),
  __webpack_require__(/*! ./ast/noop */ "./node_modules/php-parser/src/ast/noop.js"),
  __webpack_require__(/*! ./ast/nowdoc */ "./node_modules/php-parser/src/ast/nowdoc.js"),
  __webpack_require__(/*! ./ast/nullkeyword */ "./node_modules/php-parser/src/ast/nullkeyword.js"),
  __webpack_require__(/*! ./ast/number */ "./node_modules/php-parser/src/ast/number.js"),
  __webpack_require__(/*! ./ast/offsetlookup */ "./node_modules/php-parser/src/ast/offsetlookup.js"),
  __webpack_require__(/*! ./ast/operation */ "./node_modules/php-parser/src/ast/operation.js"),
  __webpack_require__(/*! ./ast/parameter */ "./node_modules/php-parser/src/ast/parameter.js"),
  __webpack_require__(/*! ./ast/parentreference */ "./node_modules/php-parser/src/ast/parentreference.js"),
  __webpack_require__(/*! ./ast/post */ "./node_modules/php-parser/src/ast/post.js"),
  __webpack_require__(/*! ./ast/pre */ "./node_modules/php-parser/src/ast/pre.js"),
  __webpack_require__(/*! ./ast/print */ "./node_modules/php-parser/src/ast/print.js"),
  __webpack_require__(/*! ./ast/program */ "./node_modules/php-parser/src/ast/program.js"),
  __webpack_require__(/*! ./ast/property */ "./node_modules/php-parser/src/ast/property.js"),
  __webpack_require__(/*! ./ast/propertylookup */ "./node_modules/php-parser/src/ast/propertylookup.js"),
  __webpack_require__(/*! ./ast/propertystatement */ "./node_modules/php-parser/src/ast/propertystatement.js"),
  __webpack_require__(/*! ./ast/reference */ "./node_modules/php-parser/src/ast/reference.js"),
  __webpack_require__(/*! ./ast/retif */ "./node_modules/php-parser/src/ast/retif.js"),
  __webpack_require__(/*! ./ast/return */ "./node_modules/php-parser/src/ast/return.js"),
  __webpack_require__(/*! ./ast/selfreference */ "./node_modules/php-parser/src/ast/selfreference.js"),
  __webpack_require__(/*! ./ast/silent */ "./node_modules/php-parser/src/ast/silent.js"),
  __webpack_require__(/*! ./ast/statement */ "./node_modules/php-parser/src/ast/statement.js"),
  __webpack_require__(/*! ./ast/static */ "./node_modules/php-parser/src/ast/static.js"),
  __webpack_require__(/*! ./ast/staticvariable */ "./node_modules/php-parser/src/ast/staticvariable.js"),
  __webpack_require__(/*! ./ast/staticlookup */ "./node_modules/php-parser/src/ast/staticlookup.js"),
  __webpack_require__(/*! ./ast/staticreference */ "./node_modules/php-parser/src/ast/staticreference.js"),
  __webpack_require__(/*! ./ast/string */ "./node_modules/php-parser/src/ast/string.js"),
  __webpack_require__(/*! ./ast/switch */ "./node_modules/php-parser/src/ast/switch.js"),
  __webpack_require__(/*! ./ast/throw */ "./node_modules/php-parser/src/ast/throw.js"),
  __webpack_require__(/*! ./ast/trait */ "./node_modules/php-parser/src/ast/trait.js"),
  __webpack_require__(/*! ./ast/traitalias */ "./node_modules/php-parser/src/ast/traitalias.js"),
  __webpack_require__(/*! ./ast/traitprecedence */ "./node_modules/php-parser/src/ast/traitprecedence.js"),
  __webpack_require__(/*! ./ast/traituse */ "./node_modules/php-parser/src/ast/traituse.js"),
  __webpack_require__(/*! ./ast/try */ "./node_modules/php-parser/src/ast/try.js"),
  __webpack_require__(/*! ./ast/typereference */ "./node_modules/php-parser/src/ast/typereference.js"),
  __webpack_require__(/*! ./ast/unary */ "./node_modules/php-parser/src/ast/unary.js"),
  __webpack_require__(/*! ./ast/unset */ "./node_modules/php-parser/src/ast/unset.js"),
  __webpack_require__(/*! ./ast/usegroup */ "./node_modules/php-parser/src/ast/usegroup.js"),
  __webpack_require__(/*! ./ast/useitem */ "./node_modules/php-parser/src/ast/useitem.js"),
  __webpack_require__(/*! ./ast/variable */ "./node_modules/php-parser/src/ast/variable.js"),
  __webpack_require__(/*! ./ast/variadic */ "./node_modules/php-parser/src/ast/variadic.js"),
  __webpack_require__(/*! ./ast/while */ "./node_modules/php-parser/src/ast/while.js"),
  __webpack_require__(/*! ./ast/yield */ "./node_modules/php-parser/src/ast/yield.js"),
  __webpack_require__(/*! ./ast/yieldfrom */ "./node_modules/php-parser/src/ast/yieldfrom.js"),
].forEach(function (ctor) {
  AST.prototype[ctor.kind] = ctor;
});

module.exports = AST;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/array.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/array.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expr = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "array";

/**
 * Defines an array structure
 * @constructor Array
 * @example
 * // PHP code :
 * [1, 'foo' => 'bar', 3]
 *
 * // AST structure :
 * {
 *  "kind": "array",
 *  "shortForm": true
 *  "items": [
 *    {"kind": "number", "value": "1"},
 *    {
 *      "kind": "entry",
 *      "key": {"kind": "string", "value": "foo", "isDoubleQuote": false},
 *      "value": {"kind": "string", "value": "bar", "isDoubleQuote": false}
 *    },
 *    {"kind": "number", "value": "3"}
 *  ]
 * }
 * @extends {Expression}
 * @property {Entry|Expr|Variable} items List of array items
 * @property {boolean} shortForm Indicate if the short array syntax is used, ex `[]` instead `array()`
 */
module.exports = Expr.extends(KIND, function Array(
  shortForm,
  items,
  docs,
  location
) {
  Expr.apply(this, [KIND, docs, location]);
  this.items = items;
  this.shortForm = shortForm;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/arrowfunc.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/ast/arrowfunc.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "arrowfunc";

/**
 * Defines an arrow function (it's like a closure)
 * @constructor ArrowFunc
 * @extends {Expression}
 * @property {Parameter[]} arguments
 * @property {Identifier} type
 * @property {Expression} body
 * @property {boolean} byref
 * @property {boolean} nullable
 * @property {boolean} isStatic
 */
module.exports = Expression.extends(KIND, function Closure(
  args,
  byref,
  body,
  type,
  nullable,
  isStatic,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.arguments = args;
  this.byref = byref;
  this.body = body;
  this.type = type;
  this.nullable = nullable;
  this.isStatic = isStatic || false;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/assign.js":
/*!***************************************************!*\
  !*** ./node_modules/php-parser/src/ast/assign.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "assign";

/**
 * Assigns a value to the specified target
 * @constructor Assign
 * @extends {Expression}
 * @property {Expression} left
 * @property {Expression} right
 * @property {String} operator
 */
module.exports = Expression.extends(KIND, function Assign(
  left,
  right,
  operator,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.left = left;
  this.right = right;
  this.operator = operator;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/assignref.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/ast/assignref.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "assignref";

/**
 * Assigns a value to the specified target
 * @constructor Assign
 * @extends {Expression}
 * @property {Expression} left
 * @property {Expression} right
 * @property {String} operator
 */
module.exports = Expression.extends(KIND, function AssignRef(
  left,
  right,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.left = left;
  this.right = right;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/bin.js":
/*!************************************************!*\
  !*** ./node_modules/php-parser/src/ast/bin.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Operation = __webpack_require__(/*! ./operation */ "./node_modules/php-parser/src/ast/operation.js");
const KIND = "bin";
/**
 * Binary operations
 * @constructor Bin
 * @extends {Operation}
 * @property {String} type
 * @property {Expression} left
 * @property {Expression} right
 */
module.exports = Operation.extends(KIND, function Bin(
  type,
  left,
  right,
  docs,
  location
) {
  Operation.apply(this, [KIND, docs, location]);
  this.type = type;
  this.left = left;
  this.right = right;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/block.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/block.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "block";

/**
 * A block statement, i.e., a sequence of statements surrounded by braces.
 * @constructor Block
 * @extends {Statement}
 * @property {Node[]} children
 */
module.exports = Statement.extends(KIND, function Block(
  kind,
  children,
  docs,
  location
) {
  Statement.apply(this, [kind || KIND, docs, location]);
  this.children = children.filter(Boolean);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/boolean.js":
/*!****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/boolean.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(/*! ./literal */ "./node_modules/php-parser/src/ast/literal.js");
const KIND = "boolean";

/**
 * Defines a boolean value (true/false)
 * @constructor Boolean
 * @extends {Literal}
 */
module.exports = Literal.extends(KIND, function Boolean(
  value,
  raw,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/break.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/break.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "break";

/**
 * A break statement
 * @constructor Break
 * @extends {Statement}
 * @property {Number|Null} level
 */
module.exports = Statement.extends(KIND, function Break(level, docs, location) {
  Statement.apply(this, [KIND, docs, location]);
  this.level = level;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/byref.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/byref.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "byref";

/**
 * Passing by Reference - so the function can modify the variable
 * @constructor ByRef
 * @extends {Expression}
 * @property {expr} what
 */
module.exports = Expression.extends(KIND, function ByRef(what, docs, location) {
  Expression.apply(this, [KIND, docs, location]);
  this.what = what;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/call.js":
/*!*************************************************!*\
  !*** ./node_modules/php-parser/src/ast/call.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "call";

/**
 * Executes a call statement
 * @constructor Call
 * @extends {Expression}
 * @property {Identifier|Variable|??} what
 * @property {Arguments[]} arguments
 */
module.exports = Expression.extends(KIND, function Call(
  what,
  args,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.what = what;
  this.arguments = args;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/case.js":
/*!*************************************************!*\
  !*** ./node_modules/php-parser/src/ast/case.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "case";

/**
 * A switch case statement
 * @constructor Case
 * @extends {Statement}
 * @property {Expression|null} test - if null, means that the default case
 * @property {Block|null} body
 */
module.exports = Statement.extends(KIND, function Case(
  test,
  body,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.test = test;
  this.body = body;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/cast.js":
/*!*************************************************!*\
  !*** ./node_modules/php-parser/src/ast/cast.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Operation = __webpack_require__(/*! ./operation */ "./node_modules/php-parser/src/ast/operation.js");
const KIND = "cast";

/**
 * Binary operations
 * @constructor Cast
 * @extends {Operation}
 * @property {String} type
 * @property {String} raw
 * @property {Expression} expr
 */
module.exports = Operation.extends(KIND, function Cast(
  type,
  raw,
  expr,
  docs,
  location
) {
  Operation.apply(this, [KIND, docs, location]);
  this.type = type;
  this.raw = raw;
  this.expr = expr;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/catch.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/catch.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "catch";

/**
 * Defines a catch statement
 * @constructor Catch
 * @extends {Statement}
 * @property {Identifier[]} what
 * @property {Variable} variable
 * @property {Statement} body
 * @see http://php.net/manual/en/language.exceptions.php
 */
module.exports = Statement.extends(KIND, function Catch(
  body,
  what,
  variable,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.body = body;
  this.what = what;
  this.variable = variable;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/class.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/class.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Declaration = __webpack_require__(/*! ./declaration */ "./node_modules/php-parser/src/ast/declaration.js");
const KIND = "class";

/**
 * A class definition
 * @constructor Class
 * @extends {Declaration}
 * @property {Identifier|null} extends
 * @property {Identifier[]} implements
 * @property {Declaration[]} body
 * @property {boolean} isAnonymous
 * @property {boolean} isAbstract
 * @property {boolean} isFinal
 */
module.exports = Declaration.extends(KIND, function Class(
  name,
  ext,
  impl,
  body,
  flags,
  docs,
  location
) {
  Declaration.apply(this, [KIND, name, docs, location]);
  this.isAnonymous = name ? false : true;
  this.extends = ext;
  this.implements = impl;
  this.body = body;
  this.parseFlags(flags);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/classconstant.js":
/*!**********************************************************!*\
  !*** ./node_modules/php-parser/src/ast/classconstant.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const ConstantStatement = __webpack_require__(/*! ./constantstatement */ "./node_modules/php-parser/src/ast/constantstatement.js");
const KIND = "classconstant";

const IS_UNDEFINED = "";
const IS_PUBLIC = "public";
const IS_PROTECTED = "protected";
const IS_PRIVATE = "private";

/**
 * Defines a class/interface/trait constant
 * @constructor ClassConstant
 * @extends {ConstantStatement}
 * @property {string} visibility
 */
const ClassConstant = ConstantStatement.extends(KIND, function ClassConstant(
  kind,
  constants,
  flags,
  docs,
  location
) {
  ConstantStatement.apply(this, [kind || KIND, constants, docs, location]);
  this.parseFlags(flags);
});

/**
 * Generic flags parser
 * @param {Integer[]} flags
 * @return {void}
 */
ClassConstant.prototype.parseFlags = function (flags) {
  if (flags[0] === -1) {
    this.visibility = IS_UNDEFINED;
  } else if (flags[0] === null) {
    this.visibility = null;
  } else if (flags[0] === 0) {
    this.visibility = IS_PUBLIC;
  } else if (flags[0] === 1) {
    this.visibility = IS_PROTECTED;
  } else if (flags[0] === 2) {
    this.visibility = IS_PRIVATE;
  }
};

module.exports = ClassConstant;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/clone.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/clone.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "clone";

/**
 * Defines a clone call
 * @constructor Clone
 * @extends {Expression}
 * @property {Expression} what
 */
module.exports = Expression.extends(KIND, function Clone(what, docs, location) {
  Expression.apply(this, [KIND, docs, location]);
  this.what = what;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/closure.js":
/*!****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/closure.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "closure";

/**
 * Defines a closure
 * @constructor Closure
 * @extends {Expression}
 * @property {Parameter[]} arguments
 * @property {Variable[]} uses
 * @property {Identifier} type
 * @property {boolean} byref
 * @property {boolean} nullable
 * @property {Block|null} body
 * @property {boolean} isStatic
 */
module.exports = Expression.extends(KIND, function Closure(
  args,
  byref,
  uses,
  type,
  nullable,
  isStatic,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.uses = uses;
  this.arguments = args;
  this.byref = byref;
  this.type = type;
  this.nullable = nullable;
  this.isStatic = isStatic || false;
  this.body = null;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/comment.js":
/*!****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/comment.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");

/**
 * Abstract documentation node (ComentLine or CommentBlock)
 * @constructor Comment
 * @extends {Node}
 * @property {String} value
 */
module.exports = Node.extends("comment", function Comment(
  kind,
  value,
  docs,
  location
) {
  Node.apply(this, [kind, docs, location]);
  this.value = value;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/commentblock.js":
/*!*********************************************************!*\
  !*** ./node_modules/php-parser/src/ast/commentblock.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Comment = __webpack_require__(/*! ./comment */ "./node_modules/php-parser/src/ast/comment.js");
const KIND = "commentblock";

/**
 * A comment block (multiline)
 * @constructor CommentBlock
 * @extends {Comment}
 */
module.exports = Comment.extends(KIND, function CommentBlock(
  value,
  docs,
  location
) {
  Comment.apply(this, [KIND, value, docs, location]);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/commentline.js":
/*!********************************************************!*\
  !*** ./node_modules/php-parser/src/ast/commentline.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Comment = __webpack_require__(/*! ./comment */ "./node_modules/php-parser/src/ast/comment.js");
const KIND = "commentline";

/**
 * A single line comment
 * @constructor CommentLine
 * @extends {Comment}
 */
module.exports = Comment.extends(KIND, function CommentLine(
  value,
  docs,
  location
) {
  Comment.apply(this, [KIND, value, docs, location]);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/constant.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/constant.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");
const KIND = "constant";

/**
 * Defines a constant
 * @constructor Constant
 * @extends {Node}
 * @property {string} name
 * @property {Node|string|number|boolean|null} value
 */
module.exports = Node.extends(KIND, function Constant(
  name,
  value,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.name = name;
  this.value = value;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/constantstatement.js":
/*!**************************************************************!*\
  !*** ./node_modules/php-parser/src/ast/constantstatement.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "constantstatement";

/**
 * Declares a constants into the current scope
 * @constructor ConstantStatement
 * @extends {Statement}
 * @property {Constant[]} constants
 */
module.exports = Statement.extends(KIND, function ConstantStatement(
  kind,
  constants,
  docs,
  location
) {
  Statement.apply(this, [kind || KIND, docs, location]);
  this.constants = constants;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/continue.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/continue.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "continue";

/**
 * A continue statement
 * @constructor Continue
 * @extends {Statement}
 * @property {Number|Null} level
 */
module.exports = Statement.extends(KIND, function Continue(
  level,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.level = level;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/declaration.js":
/*!********************************************************!*\
  !*** ./node_modules/php-parser/src/ast/declaration.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "declaration";

const IS_UNDEFINED = "";
const IS_PUBLIC = "public";
const IS_PROTECTED = "protected";
const IS_PRIVATE = "private";

/**
 * A declaration statement (function, class, interface...)
 * @constructor Declaration
 * @extends {Statement}
 * @property {Identifier|string} name
 */
const Declaration = Statement.extends(KIND, function Declaration(
  kind,
  name,
  docs,
  location
) {
  Statement.apply(this, [kind || KIND, docs, location]);
  this.name = name;
});

/**
 * Generic flags parser
 * @param {Integer[]} flags
 * @return {void}
 */
Declaration.prototype.parseFlags = function (flags) {
  this.isAbstract = flags[2] === 1;
  this.isFinal = flags[2] === 2;
  if (this.kind !== "class") {
    if (flags[0] === -1) {
      this.visibility = IS_UNDEFINED;
    } else if (flags[0] === null) {
      this.visibility = null;
    } else if (flags[0] === 0) {
      this.visibility = IS_PUBLIC;
    } else if (flags[0] === 1) {
      this.visibility = IS_PROTECTED;
    } else if (flags[0] === 2) {
      this.visibility = IS_PRIVATE;
    }
    this.isStatic = flags[1] === 1;
  }
};

module.exports = Declaration;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/declare.js":
/*!****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/declare.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Block = __webpack_require__(/*! ./block */ "./node_modules/php-parser/src/ast/block.js");
const KIND = "declare";

/**
 * The declare construct is used to set execution directives for a block of code
 * @constructor Declare
 * @extends {Block}
 * @property {Array[]} directives
 * @property {String} mode
 * @see http://php.net/manual/en/control-structures.declare.php
 */
const Declare = Block.extends(KIND, function Declare(
  directives,
  body,
  mode,
  docs,
  location
) {
  Block.apply(this, [KIND, body, docs, location]);
  this.directives = directives;
  this.mode = mode;
});

/**
 * The node is declared as a short tag syntax :
 * ```php
 * <?php
 * declare(ticks=1):
 * // some statements
 * enddeclare;
 * ```
 * @constant {String} MODE_SHORT
 */
Declare.MODE_SHORT = "short";

/**
 * The node is declared bracket enclosed code :
 * ```php
 * <?php
 * declare(ticks=1) {
 * // some statements
 * }
 * ```
 * @constant {String} MODE_BLOCK
 */
Declare.MODE_BLOCK = "block";

/**
 * The node is declared as a simple statement. In order to make things simpler
 * children of the node are automatically collected until the next
 * declare statement.
 * ```php
 * <?php
 * declare(ticks=1);
 * // some statements
 * declare(ticks=2);
 * // some statements
 * ```
 * @constant {String} MODE_NONE
 */
Declare.MODE_NONE = "none";

module.exports = Declare;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/declaredirective.js":
/*!*************************************************************!*\
  !*** ./node_modules/php-parser/src/ast/declaredirective.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");
const KIND = "declaredirective";

/**
 * Defines a constant
 * @constructor DeclareDirective
 * @extends {Node}
 * @property {Identifier} name
 * @property {Node|string|number|boolean|null} value
 */
module.exports = Node.extends(KIND, function DeclareDirective(
  key,
  value,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.key = key;
  this.value = value;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/do.js":
/*!***********************************************!*\
  !*** ./node_modules/php-parser/src/ast/do.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "do";

/**
 * Defines a do/while statement
 * @constructor Do
 * @extends {Statement}
 * @property {Expression} test
 * @property {Statement} body
 */
module.exports = Statement.extends(KIND, function Do(
  test,
  body,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.test = test;
  this.body = body;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/echo.js":
/*!*************************************************!*\
  !*** ./node_modules/php-parser/src/ast/echo.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "echo";

/**
 * Defines system based call
 * @constructor Echo
 * @property {boolean} shortForm
 * @extends {Statement}
 */
module.exports = Statement.extends(KIND, function Echo(
  expressions,
  shortForm,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.shortForm = shortForm;
  this.expressions = expressions;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/empty.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/empty.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "empty";

/**
 * Defines an empty check call
 * @constructor Empty
 * @extends {Expression}
 */
module.exports = Expression.extends(KIND, function Empty(
  expression,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.expression = expression;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/encapsed.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/encapsed.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(/*! ./literal */ "./node_modules/php-parser/src/ast/literal.js");
const KIND = "encapsed";

/**
 * Defines an encapsed string (contains expressions)
 * @constructor Encapsed
 * @extends {Literal}
 * @property {String} type - Defines the type of encapsed string (shell, heredoc, string)
 * @property {String|Null} label - The heredoc label, defined only when the type is heredoc
 */
const Encapsed = Literal.extends(KIND, function Encapsed(
  value,
  raw,
  type,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
  this.type = type;
});

/**
 * The node is a double quote string :
 * ```php
 * <?php
 * echo "hello $world";
 * ```
 * @constant {String} TYPE_STRING - `string`
 */
Encapsed.TYPE_STRING = "string";

/**
 * The node is a shell execute string :
 * ```php
 * <?php
 * echo `ls -larth $path`;
 * ```
 * @constant {String} TYPE_SHELL - `shell`
 */
Encapsed.TYPE_SHELL = "shell";

/**
 * The node is a shell execute string :
 * ```php
 * <?php
 * echo <<<STR
 *  Hello $world
 * STR
 * ;
 * ```
 * @constant {String} TYPE_HEREDOC - `heredoc`
 */
Encapsed.TYPE_HEREDOC = "heredoc";

/**
 * The node contains a list of constref / variables / expr :
 * ```php
 * <?php
 * echo $foo->bar_$baz;
 * ```
 * @constant {String} TYPE_OFFSET - `offset`
 */
Encapsed.TYPE_OFFSET = "offset";

module.exports = Encapsed;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/encapsedpart.js":
/*!*********************************************************!*\
  !*** ./node_modules/php-parser/src/ast/encapsedpart.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "encapsedpart";

/**
 * Part of `Encapsed` node
 * @constructor EncapsedPart
 * @extends {Expression}
 * @property {Expression} expression
 * @property {String} syntax
 * @property {Boolean} curly
 */
module.exports = Expression.extends(KIND, function EncapsedPart(
  expression,
  syntax,
  curly,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.expression = expression;
  this.syntax = syntax;
  this.curly = curly;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/entry.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/entry.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "entry";

/**
 * An array entry - see [Array](#array)
 * @constructor Entry
 * @extends {Expression}
 * @property {Node|null} key The entry key/offset
 * @property {Node} value The entry value
 * @property {Boolean} byRef By reference
 * @property {Boolean} unpack Argument unpacking
 */
module.exports = Expression.extends(KIND, function Entry(
  key,
  value,
  byRef,
  unpack,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.key = key;
  this.value = value;
  this.byRef = byRef;
  this.unpack = unpack;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/error.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/error.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");
const KIND = "error";

/**
 * Defines an error node (used only on silentMode)
 * @constructor Error
 * @extends {Node}
 * @property {string} message
 * @property {number} line
 * @property {number|string} token
 * @property {string|array} expected
 */
module.exports = Node.extends(KIND, function Error(
  message,
  token,
  line,
  expected,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.message = message;
  this.token = token;
  this.line = line;
  this.expected = expected;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/eval.js":
/*!*************************************************!*\
  !*** ./node_modules/php-parser/src/ast/eval.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "eval";

/**
 * Defines an eval statement
 * @constructor Eval
 * @extends {Expression}
 * @property {Node} source
 */
module.exports = Expression.extends(KIND, function Eval(
  source,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.source = source;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/exit.js":
/*!*************************************************!*\
  !*** ./node_modules/php-parser/src/ast/exit.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "exit";

/**
 * Defines an exit / die call
 * @constructor Exit
 * @extends {Expression}
 * @property {Node|null} expression
 * @property {Boolean} useDie
 */
module.exports = Expression.extends(KIND, function Exit(
  expression,
  useDie,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.expression = expression;
  this.useDie = useDie;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/expression.js":
/*!*******************************************************!*\
  !*** ./node_modules/php-parser/src/ast/expression.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");
const KIND = "expression";

/**
 * Any expression node. Since the left-hand side of an assignment may
 * be any expression in general, an expression can also be a pattern.
 * @constructor Expression
 * @extends {Node}
 */
module.exports = Node.extends(KIND, function Expression(kind, docs, location) {
  Node.apply(this, [kind || KIND, docs, location]);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/expressionstatement.js":
/*!****************************************************************!*\
  !*** ./node_modules/php-parser/src/ast/expressionstatement.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "expressionstatement";

/**
 * Defines an expression based statement
 * @constructor ExpressionStatement
 * @extends {Statement}
 * @property {Expression} expression
 */
module.exports = Statement.extends(KIND, function ExpressionStatement(
  expr,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.expression = expr;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/for.js":
/*!************************************************!*\
  !*** ./node_modules/php-parser/src/ast/for.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "for";

/**
 * Defines a for iterator
 * @constructor For
 * @extends {Statement}
 * @property {Expression[]} init
 * @property {Expression[]} test
 * @property {Expression[]} increment
 * @property {Statement} body
 * @property {boolean} shortForm
 * @see http://php.net/manual/en/control-structures.for.php
 */
module.exports = Statement.extends(KIND, function For(
  init,
  test,
  increment,
  body,
  shortForm,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.init = init;
  this.test = test;
  this.increment = increment;
  this.shortForm = shortForm;
  this.body = body;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/foreach.js":
/*!****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/foreach.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "foreach";

/**
 * Defines a foreach iterator
 * @constructor Foreach
 * @extends {Statement}
 * @property {Expression} source
 * @property {Expression|null} key
 * @property {Expression} value
 * @property {Statement} body
 * @property {boolean} shortForm
 * @see http://php.net/manual/en/control-structures.foreach.php
 */
module.exports = Statement.extends(KIND, function Foreach(
  source,
  key,
  value,
  body,
  shortForm,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.source = source;
  this.key = key;
  this.value = value;
  this.shortForm = shortForm;
  this.body = body;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/function.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/function.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Declaration = __webpack_require__(/*! ./declaration */ "./node_modules/php-parser/src/ast/declaration.js");
const KIND = "function";

/**
 * Defines a classic function
 * @constructor Function
 * @extends {Declaration}
 * @property {Parameter[]} arguments
 * @property {Identifier} type
 * @property {boolean} byref
 * @property {boolean} nullable
 * @property {Block|null} body
 */
module.exports = Declaration.extends(KIND, function _Function(
  name,
  args,
  byref,
  type,
  nullable,
  docs,
  location
) {
  Declaration.apply(this, [KIND, name, docs, location]);
  this.arguments = args;
  this.byref = byref;
  this.type = type;
  this.nullable = nullable;
  this.body = null;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/global.js":
/*!***************************************************!*\
  !*** ./node_modules/php-parser/src/ast/global.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "global";

/**
 * Imports a variable from the global scope
 * @constructor Global
 * @extends {Statement}
 * @property {Variable[]} items
 */
module.exports = Statement.extends(KIND, function Global(
  items,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.items = items;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/goto.js":
/*!*************************************************!*\
  !*** ./node_modules/php-parser/src/ast/goto.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "goto";

/**
 * Defines goto statement
 * @constructor Goto
 * @extends {Statement}
 * @property {String} label
 * @see {Label}
 */
module.exports = Statement.extends(KIND, function Goto(label, docs, location) {
  Statement.apply(this, [KIND, docs, location]);
  this.label = label;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/halt.js":
/*!*************************************************!*\
  !*** ./node_modules/php-parser/src/ast/halt.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "halt";

/**
 * Halts the compiler execution
 * @constructor Halt
 * @extends {Statement}
 * @property {String} after - String after the halt statement
 * @see http://php.net/manual/en/function.halt-compiler.php
 */
module.exports = Statement.extends(KIND, function Halt(after, docs, location) {
  Statement.apply(this, [KIND, docs, location]);
  this.after = after;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/identifier.js":
/*!*******************************************************!*\
  !*** ./node_modules/php-parser/src/ast/identifier.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");
const KIND = "identifier";

/**
 * Defines an identifier node
 * @constructor Identifier
 * @extends {Node}
 * @property {string} name
 */
const Identifier = Node.extends(KIND, function Identifier(
  name,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.name = name;
});

module.exports = Identifier;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/if.js":
/*!***********************************************!*\
  !*** ./node_modules/php-parser/src/ast/if.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "if";

/**
 * Defines a if statement
 * @constructor If
 * @extends {Statement}
 * @property {Expression} test
 * @property {Block} body
 * @property {Block|If|null} alternate
 * @property {boolean} shortForm
 */
module.exports = Statement.extends(KIND, function If(
  test,
  body,
  alternate,
  shortForm,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.test = test;
  this.body = body;
  this.alternate = alternate;
  this.shortForm = shortForm;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/include.js":
/*!****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/include.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "include";

/**
 * Defines system include call
 * @constructor Include
 * @extends {Expression}
 * @property {Node} target
 * @property {boolean} once
 * @property {boolean} require
 */
module.exports = Expression.extends(KIND, function Include(
  once,
  require,
  target,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.once = once;
  this.require = require;
  this.target = target;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/inline.js":
/*!***************************************************!*\
  !*** ./node_modules/php-parser/src/ast/inline.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(/*! ./literal */ "./node_modules/php-parser/src/ast/literal.js");
const KIND = "inline";

/**
 * Defines inline html output (treated as echo output)
 * @constructor Inline
 * @extends {Literal}
 */
module.exports = Literal.extends(KIND, function Inline(
  value,
  raw,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/interface.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/ast/interface.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Declaration = __webpack_require__(/*! ./declaration */ "./node_modules/php-parser/src/ast/declaration.js");
const KIND = "interface";

/**
 * An interface definition
 * @constructor Interface
 * @extends {Declaration}
 * @property {Identifier[]} extends
 * @property {Declaration[]} body
 */
module.exports = Declaration.extends(KIND, function Interface(
  name,
  ext,
  body,
  docs,
  location
) {
  Declaration.apply(this, [KIND, name, docs, location]);
  this.extends = ext;
  this.body = body;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/isset.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/isset.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "isset";

/**
 * Defines an isset call
 * @constructor Isset
 * @extends {Expression}
 */
module.exports = Expression.extends(KIND, function Isset(
  variables,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.variables = variables;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/label.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/label.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "label";

/**
 * A label statement (referenced by goto)
 * @constructor Label
 * @extends {Statement}
 * @property {String} name
 */
module.exports = Statement.extends(KIND, function Label(name, docs, location) {
  Statement.apply(this, [KIND, docs, location]);
  this.name = name;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/list.js":
/*!*************************************************!*\
  !*** ./node_modules/php-parser/src/ast/list.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "list";

/**
 * Defines list assignment
 * @constructor List
 * @extends {Expression}
 * @property {boolean} shortForm
 */
module.exports = Expression.extends(KIND, function List(
  items,
  shortForm,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.items = items;
  this.shortForm = shortForm;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/literal.js":
/*!****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/literal.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "literal";

/**
 * Defines an array structure
 * @constructor Literal
 * @extends {Expression}
 * @property {string} raw
 * @property {Node|string|number|boolean|null} value
 */
module.exports = Expression.extends(KIND, function Literal(
  kind,
  value,
  raw,
  docs,
  location
) {
  Expression.apply(this, [kind || KIND, docs, location]);
  this.value = value;
  if (raw) {
    this.raw = raw;
  }
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/location.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/location.js ***!
  \*****************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/**
 * Defines the location of the node (with it's source contents as string)
 * @constructor Location
 * @property {String|null} source
 * @property {Position} start
 * @property {Position} end
 */
const Location = function (source, start, end) {
  this.source = source;
  this.start = start;
  this.end = end;
};

module.exports = Location;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/lookup.js":
/*!***************************************************!*\
  !*** ./node_modules/php-parser/src/ast/lookup.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expr = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "lookup";

/**
 * Lookup on an offset in the specified object
 * @constructor Lookup
 * @extends {Expression}
 * @property {Expression} what
 * @property {Expression} offset
 */
module.exports = Expr.extends(KIND, function Lookup(
  kind,
  what,
  offset,
  docs,
  location
) {
  Expr.apply(this, [kind || KIND, docs, location]);
  this.what = what;
  this.offset = offset;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/magic.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/magic.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(/*! ./literal */ "./node_modules/php-parser/src/ast/literal.js");
const KIND = "magic";

/**
 * Defines magic constant
 * @constructor Magic
 * @extends {Literal}
 */
module.exports = Literal.extends(KIND, function Magic(
  value,
  raw,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/method.js":
/*!***************************************************!*\
  !*** ./node_modules/php-parser/src/ast/method.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const _Function = __webpack_require__(/*! ./function */ "./node_modules/php-parser/src/ast/function.js");
const KIND = "method";

/**
 * Defines a class/interface/trait method
 * @constructor Method
 * @extends {_Function}
 * @property {boolean} isAbstract
 * @property {boolean} isFinal
 * @property {boolean} isStatic
 * @property {string} visibility
 */
module.exports = _Function.extends(KIND, function Method() {
  _Function.apply(this, arguments);
  this.kind = KIND;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/name.js":
/*!*************************************************!*\
  !*** ./node_modules/php-parser/src/ast/name.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Reference = __webpack_require__(/*! ./reference */ "./node_modules/php-parser/src/ast/reference.js");
const KIND = "name";

/**
 * Defines a class reference node
 * @constructor Name
 * @extends {Reference}
 * @property {string} name
 * @property {string} resolution
 */
const Name = Reference.extends(KIND, function Name(
  name,
  isRelative,
  docs,
  location
) {
  Reference.apply(this, [KIND, docs, location]);
  if (isRelative) {
    this.resolution = Name.RELATIVE_NAME;
  } else if (name.length === 1) {
    this.resolution = Name.UNQUALIFIED_NAME;
  } else if (!name[0]) {
    this.resolution = Name.FULL_QUALIFIED_NAME;
  } else {
    this.resolution = Name.QUALIFIED_NAME;
  }
  this.name = name.join("\\");
});

/**
 * This is an identifier without a namespace separator, such as Foo
 * @constant {String} UNQUALIFIED_NAME
 */
Name.UNQUALIFIED_NAME = "uqn";
/**
 * This is an identifier with a namespace separator, such as Foo\Bar
 * @constant {String} QUALIFIED_NAME
 */
Name.QUALIFIED_NAME = "qn";
/**
 * This is an identifier with a namespace separator that begins with
 * a namespace separator, such as \Foo\Bar. The namespace \Foo is also
 * a fully qualified name.
 * @constant {String} FULL_QUALIFIED_NAME
 */
Name.FULL_QUALIFIED_NAME = "fqn";
/**
 * This is an identifier starting with namespace, such as namespace\Foo\Bar.
 * @constant {String} RELATIVE_NAME
 */
Name.RELATIVE_NAME = "rn";

module.exports = Name;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/namespace.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/ast/namespace.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Block = __webpack_require__(/*! ./block */ "./node_modules/php-parser/src/ast/block.js");
const KIND = "namespace";

/**
 * The main program node
 * @constructor Namespace
 * @extends {Block}
 * @property {String} name
 * @property {Boolean} withBrackets
 */
module.exports = Block.extends(KIND, function Namespace(
  name,
  children,
  withBrackets,
  docs,
  location
) {
  Block.apply(this, [KIND, children, docs, location]);
  this.name = name;
  this.withBrackets = withBrackets || false;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/new.js":
/*!************************************************!*\
  !*** ./node_modules/php-parser/src/ast/new.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "new";

/**
 * Creates a new instance of the specified class
 * @constructor New
 * @extends {Expression}
 * @property {Identifier|Variable|Class} what
 * @property {Arguments[]} arguments
 */
module.exports = Expression.extends(KIND, function New(
  what,
  args,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.what = what;
  this.arguments = args;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/node.js":
/*!*************************************************!*\
  !*** ./node_modules/php-parser/src/ast/node.js ***!
  \*************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/**
 * A generic AST node
 * @constructor Node
 * @property {Location|null} loc
 * @property {Comment[]} leadingComments
 * @property {Comment[]?} trailingComments
 * @property {String} kind
 */
const Node = function Node(kind, docs, location) {
  this.kind = kind;
  if (docs) {
    this.leadingComments = docs;
  }
  if (location) {
    this.loc = location;
  }
};

/**
 * Attach comments to current node
 * @param {*} docs
 */
Node.prototype.setTrailingComments = function (docs) {
  this.trailingComments = docs;
};

/**
 * Destroying an unused node
 */
Node.prototype.destroy = function (node) {
  if (!node) {
    throw new Error(
      "Node already initialized, you must swap with another node"
    );
  }
  if (this.leadingComments) {
    if (node.leadingComments) {
      node.leadingComments = Array.concat(
        this.leadingComments,
        node.leadingComments
      );
    } else {
      node.leadingComments = this.leadingComments;
    }
  }
  if (this.trailingComments) {
    if (node.trailingComments) {
      node.trailingComments = Array.concat(
        this.trailingComments,
        node.trailingComments
      );
    } else {
      node.trailingComments = this.trailingComments;
    }
  }
  return node;
};

/**
 * Includes current token position of the parser
 * @param {*} parser
 */
Node.prototype.includeToken = function (parser) {
  if (this.loc) {
    if (this.loc.end) {
      this.loc.end.line = parser.lexer.yylloc.last_line;
      this.loc.end.column = parser.lexer.yylloc.last_column;
      this.loc.end.offset = parser.lexer.offset;
    }
    if (parser.ast.withSource) {
      this.loc.source = parser.lexer._input.substring(
        this.loc.start.offset,
        parser.lexer.offset
      );
    }
  }
  return this;
};

/**
 * Helper for extending the Node class
 * @param {String} type
 * @param {Function} constructor
 * @return {Function}
 */
Node.extends = function (type, constructor) {
  constructor.prototype = Object.create(this.prototype);
  constructor.extends = this.extends;
  constructor.prototype.constructor = constructor;
  constructor.kind = type;
  return constructor;
};

module.exports = Node;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/noop.js":
/*!*************************************************!*\
  !*** ./node_modules/php-parser/src/ast/noop.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");
const KIND = "noop";

/**
 * Ignore this node, it implies a no operation block, for example :
 * [$foo, $bar, /* here a noop node * /]
 * @constructor Noop
 * @extends {Node}
 */
module.exports = Node.extends(KIND, function Noop(docs, location) {
  Node.apply(this, [KIND, docs, location]);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/nowdoc.js":
/*!***************************************************!*\
  !*** ./node_modules/php-parser/src/ast/nowdoc.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(/*! ./literal */ "./node_modules/php-parser/src/ast/literal.js");
const KIND = "nowdoc";

/**
 * Defines a nowdoc string
 * @constructor NowDoc
 * @extends {Literal}
 * @property {String} label
 * @property {String} raw
 */
module.exports = Literal.extends(KIND, function Nowdoc(
  value,
  raw,
  label,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
  this.label = label;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/nullkeyword.js":
/*!********************************************************!*\
  !*** ./node_modules/php-parser/src/ast/nullkeyword.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");
const KIND = "nullkeyword";

/**
 * Represents the null keyword
 * @constructor NullKeyword
 * @extends {Node}
 */
module.exports = Node.extends(KIND, function NullKeyword(raw, docs, location) {
  Node.apply(this, [KIND, docs, location]);
  this.raw = raw;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/number.js":
/*!***************************************************!*\
  !*** ./node_modules/php-parser/src/ast/number.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(/*! ./literal */ "./node_modules/php-parser/src/ast/literal.js");
const KIND = "number";

/**
 * Defines a numeric value
 * @constructor Number
 * @extends {Literal}
 */
module.exports = Literal.extends(KIND, function Number(
  value,
  raw,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/offsetlookup.js":
/*!*********************************************************!*\
  !*** ./node_modules/php-parser/src/ast/offsetlookup.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Lookup = __webpack_require__(/*! ./lookup */ "./node_modules/php-parser/src/ast/lookup.js");
const KIND = "offsetlookup";

/**
 * Lookup on an offset in an array
 * @constructor OffsetLookup
 * @extends {Lookup}
 */
module.exports = Lookup.extends(KIND, function OffsetLookup(
  what,
  offset,
  docs,
  location
) {
  Lookup.apply(this, [KIND, what, offset, docs, location]);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/operation.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/ast/operation.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expr = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "operation";

/**
 * Defines binary operations
 * @constructor Operation
 * @extends {Expression}
 */
module.exports = Expr.extends(KIND, function Operation(kind, docs, location) {
  Expr.apply(this, [kind || KIND, docs, location]);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/parameter.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/ast/parameter.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Declaration = __webpack_require__(/*! ./declaration */ "./node_modules/php-parser/src/ast/declaration.js");
const KIND = "parameter";

/**
 * Defines a function parameter
 * @constructor Parameter
 * @extends {Declaration}
 * @property {Identifier|null} type
 * @property {Node|null} value
 * @property {boolean} byref
 * @property {boolean} variadic
 * @property {boolean} nullable
 */
module.exports = Declaration.extends(KIND, function Parameter(
  name,
  type,
  value,
  isRef,
  isVariadic,
  nullable,
  docs,
  location
) {
  Declaration.apply(this, [KIND, name, docs, location]);
  this.value = value;
  this.type = type;
  this.byref = isRef;
  this.variadic = isVariadic;
  this.nullable = nullable;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/parentreference.js":
/*!************************************************************!*\
  !*** ./node_modules/php-parser/src/ast/parentreference.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Reference = __webpack_require__(/*! ./reference */ "./node_modules/php-parser/src/ast/reference.js");
const KIND = "parentreference";

/**
 * Defines a class reference node
 * @constructor ParentReference
 * @extends {Reference}
 */
const ParentReference = Reference.extends(KIND, function ParentReference(
  raw,
  docs,
  location
) {
  Reference.apply(this, [KIND, docs, location]);
  this.raw = raw;
});
module.exports = ParentReference;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/position.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/position.js ***!
  \*****************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/**
 * Each Position object consists of a line number (1-indexed) and a column number (0-indexed):
 * @constructor Position
 * @property {Number} line
 * @property {Number} column
 * @property {Number} offset
 */
const Position = function (line, column, offset) {
  this.line = line;
  this.column = column;
  this.offset = offset;
};

module.exports = Position;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/post.js":
/*!*************************************************!*\
  !*** ./node_modules/php-parser/src/ast/post.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Operation = __webpack_require__(/*! ./operation */ "./node_modules/php-parser/src/ast/operation.js");
const KIND = "post";

/**
 * Defines a post operation `$i++` or `$i--`
 * @constructor Post
 * @extends {Operation}
 * @property {String} type
 * @property {Variable} what
 */
module.exports = Operation.extends(KIND, function Post(
  type,
  what,
  docs,
  location
) {
  Operation.apply(this, [KIND, docs, location]);
  this.type = type;
  this.what = what;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/pre.js":
/*!************************************************!*\
  !*** ./node_modules/php-parser/src/ast/pre.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Operation = __webpack_require__(/*! ./operation */ "./node_modules/php-parser/src/ast/operation.js");
const KIND = "pre";

/**
 * Defines a pre operation `++$i` or `--$i`
 * @constructor Pre
 * @extends {Operation}
 * @property {String} type
 * @property {Variable} what
 */
module.exports = Operation.extends(KIND, function Pre(
  type,
  what,
  docs,
  location
) {
  Operation.apply(this, [KIND, docs, location]);
  this.type = type;
  this.what = what;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/print.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/print.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "print";

/**
 * Outputs
 * @constructor Print
 * @extends {Expression}
 */
module.exports = Expression.extends(KIND, function Print(
  expression,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.expression = expression;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/program.js":
/*!****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/program.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Block = __webpack_require__(/*! ./block */ "./node_modules/php-parser/src/ast/block.js");
const KIND = "program";

/**
 * The main program node
 * @constructor Program
 * @extends {Block}
 * @property {Error[]} errors
 * @property {Doc[]?} comments
 * @property {String[]?} tokens
 */
module.exports = Block.extends(KIND, function Program(
  children,
  errors,
  comments,
  tokens,
  docs,
  location
) {
  Block.apply(this, [KIND, children, docs, location]);
  this.errors = errors;
  if (comments) {
    this.comments = comments;
  }
  if (tokens) {
    this.tokens = tokens;
  }
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/property.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/property.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "property";

/**
 * Defines a class property
 * @constructor Property
 * @extends {Statement}
 * @property {string} name
 * @property {Node|null} value
 * @property {boolean} nullable
 * @property {Identifier|Array<Identifier>|null} type
 */
module.exports = Statement.extends(KIND, function Property(
  name,
  value,
  nullable,
  type,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.name = name;
  this.value = value;
  this.nullable = nullable;
  this.type = type;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/propertylookup.js":
/*!***********************************************************!*\
  !*** ./node_modules/php-parser/src/ast/propertylookup.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Lookup = __webpack_require__(/*! ./lookup */ "./node_modules/php-parser/src/ast/lookup.js");
const KIND = "propertylookup";

/**
 * Lookup to an object property
 * @constructor PropertyLookup
 * @extends {Lookup}
 */
module.exports = Lookup.extends(KIND, function PropertyLookup(
  what,
  offset,
  docs,
  location
) {
  Lookup.apply(this, [KIND, what, offset, docs, location]);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/propertystatement.js":
/*!**************************************************************!*\
  !*** ./node_modules/php-parser/src/ast/propertystatement.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "propertystatement";

const IS_UNDEFINED = "";
const IS_PUBLIC = "public";
const IS_PROTECTED = "protected";
const IS_PRIVATE = "private";

/**
 * Declares a properties into the current scope
 * @constructor PropertyStatement
 * @extends {Statement}
 * @property {Property[]} properties
 */
const PropertyStatement = Statement.extends(KIND, function PropertyStatement(
  kind,
  properties,
  flags,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.properties = properties;
  this.parseFlags(flags);
});

/**
 * Generic flags parser
 * @param {Integer[]} flags
 * @return {void}
 */
PropertyStatement.prototype.parseFlags = function (flags) {
  if (flags[0] === -1) {
    this.visibility = IS_UNDEFINED;
  } else if (flags[0] === null) {
    this.visibility = null;
  } else if (flags[0] === 0) {
    this.visibility = IS_PUBLIC;
  } else if (flags[0] === 1) {
    this.visibility = IS_PROTECTED;
  } else if (flags[0] === 2) {
    this.visibility = IS_PRIVATE;
  }

  this.isStatic = flags[1] === 1;
};

module.exports = PropertyStatement;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/reference.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/ast/reference.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");
const KIND = "reference";

/**
 * Defines a reference node
 * @constructor Reference
 * @extends {Node}
 */
const Reference = Node.extends(KIND, function Reference(kind, docs, location) {
  Node.apply(this, [kind || KIND, docs, location]);
});

module.exports = Reference;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/retif.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/retif.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "retif";

/**
 * Defines a short if statement that returns a value
 * @constructor RetIf
 * @extends {Expression}
 * @property {Expression} test
 * @property {Expression} trueExpr
 * @property {Expression} falseExpr
 */
module.exports = Expression.extends(KIND, function RetIf(
  test,
  trueExpr,
  falseExpr,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.test = test;
  this.trueExpr = trueExpr;
  this.falseExpr = falseExpr;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/return.js":
/*!***************************************************!*\
  !*** ./node_modules/php-parser/src/ast/return.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "return";

/**
 * A continue statement
 * @constructor Return
 * @extends {Statement}
 * @property {Expression|null} expr
 */
module.exports = Statement.extends(KIND, function Return(expr, docs, location) {
  Statement.apply(this, [KIND, docs, location]);
  this.expr = expr;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/selfreference.js":
/*!**********************************************************!*\
  !*** ./node_modules/php-parser/src/ast/selfreference.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Reference = __webpack_require__(/*! ./reference */ "./node_modules/php-parser/src/ast/reference.js");
const KIND = "selfreference";

/**
 * Defines a class reference node
 * @constructor SelfReference
 * @extends {Reference}
 */
const SelfReference = Reference.extends(KIND, function SelfReference(
  raw,
  docs,
  location
) {
  Reference.apply(this, [KIND, docs, location]);
  this.raw = raw;
});
module.exports = SelfReference;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/silent.js":
/*!***************************************************!*\
  !*** ./node_modules/php-parser/src/ast/silent.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "silent";

/**
 * Avoids to show/log warnings & notices from the inner expression
 * @constructor Silent
 * @extends {Expression}
 * @property {Expression} expr
 */
module.exports = Expression.extends(KIND, function Silent(
  expr,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.expr = expr;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/statement.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/ast/statement.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");
const KIND = "statement";

/**
 * Any statement.
 * @constructor Statement
 * @extends {Node}
 */
module.exports = Node.extends(KIND, function Statement(kind, docs, location) {
  Node.apply(this, [kind || KIND, docs, location]);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/static.js":
/*!***************************************************!*\
  !*** ./node_modules/php-parser/src/ast/static.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "static";

/**
 * Declares a static variable into the current scope
 * @constructor Static
 * @extends {Statement}
 * @property {StaticVariable[]} variables
 */
module.exports = Statement.extends(KIND, function Static(
  variables,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.variables = variables;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/staticlookup.js":
/*!*********************************************************!*\
  !*** ./node_modules/php-parser/src/ast/staticlookup.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Lookup = __webpack_require__(/*! ./lookup */ "./node_modules/php-parser/src/ast/lookup.js");
const KIND = "staticlookup";

/**
 * Lookup to a static property
 * @constructor StaticLookup
 * @extends {Lookup}
 */
module.exports = Lookup.extends(KIND, function StaticLookup(
  what,
  offset,
  docs,
  location
) {
  Lookup.apply(this, [KIND, what, offset, docs, location]);
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/staticreference.js":
/*!************************************************************!*\
  !*** ./node_modules/php-parser/src/ast/staticreference.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Reference = __webpack_require__(/*! ./reference */ "./node_modules/php-parser/src/ast/reference.js");
const KIND = "staticreference";

/**
 * Defines a class reference node
 * @constructor StaticReference
 * @extends {Reference}
 */
const StaticReference = Reference.extends(KIND, function StaticReference(
  raw,
  docs,
  location
) {
  Reference.apply(this, [KIND, docs, location]);
  this.raw = raw;
});
module.exports = StaticReference;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/staticvariable.js":
/*!***********************************************************!*\
  !*** ./node_modules/php-parser/src/ast/staticvariable.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");
const KIND = "staticvariable";

/**
 * Defines a constant
 * @constructor StaticVariable
 * @extends {Node}
 * @property {Variable} variable
 * @property {Node|string|number|boolean|null} defaultValue
 */
module.exports = Node.extends(KIND, function StaticVariable(
  variable,
  defaultValue,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.variable = variable;
  this.defaultValue = defaultValue;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/string.js":
/*!***************************************************!*\
  !*** ./node_modules/php-parser/src/ast/string.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(/*! ./literal */ "./node_modules/php-parser/src/ast/literal.js");
const KIND = "string";

/**
 * Defines a string (simple ou double quoted) - chars are already escaped
 * @constructor String
 * @extends {Literal}
 * @property {boolean} unicode
 * @property {boolean} isDoubleQuote
 * @see {Encapsed}
 */
module.exports = Literal.extends(KIND, function String(
  isDoubleQuote,
  value,
  unicode,
  raw,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
  this.unicode = unicode;
  this.isDoubleQuote = isDoubleQuote;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/switch.js":
/*!***************************************************!*\
  !*** ./node_modules/php-parser/src/ast/switch.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "switch";

/**
 * Defines a switch statement
 * @constructor Switch
 * @extends {Statement}
 * @property {Expression} test
 * @property {Block} body
 * @property {boolean} shortForm
 */
module.exports = Statement.extends(KIND, function Switch(
  test,
  body,
  shortForm,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.test = test;
  this.body = body;
  this.shortForm = shortForm;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/throw.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/throw.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "throw";

/**
 * Defines a throw statement
 * @constructor Throw
 * @extends {Statement}
 * @property {Expression} what
 */
module.exports = Statement.extends(KIND, function Throw(what, docs, location) {
  Statement.apply(this, [KIND, docs, location]);
  this.what = what;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/trait.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/trait.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Declaration = __webpack_require__(/*! ./declaration */ "./node_modules/php-parser/src/ast/declaration.js");
const KIND = "trait";

/**
 * A trait definition
 * @constructor Trait
 * @extends {Declaration}
 * @property {Declaration[]} body
 */
module.exports = Declaration.extends(KIND, function Trait(
  name,
  body,
  docs,
  location
) {
  Declaration.apply(this, [KIND, name, docs, location]);
  this.body = body;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/traitalias.js":
/*!*******************************************************!*\
  !*** ./node_modules/php-parser/src/ast/traitalias.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");
const KIND = "traitalias";

const IS_UNDEFINED = "";
const IS_PUBLIC = "public";
const IS_PROTECTED = "protected";
const IS_PRIVATE = "private";

/**
 * Defines a trait alias
 * @constructor TraitAlias
 * @extends {Node}
 * @property {Identifier|null} trait
 * @property {Identifier} method
 * @property {Identifier|null} as
 * @property {string|null} visibility
 */
module.exports = Node.extends(KIND, function TraitAlias(
  trait,
  method,
  as,
  flags,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.trait = trait;
  this.method = method;
  this.as = as;
  this.visibility = IS_UNDEFINED;
  if (flags) {
    if (flags[0] === 0) {
      this.visibility = IS_PUBLIC;
    } else if (flags[0] === 1) {
      this.visibility = IS_PROTECTED;
    } else if (flags[0] === 2) {
      this.visibility = IS_PRIVATE;
    }
  }
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/traitprecedence.js":
/*!************************************************************!*\
  !*** ./node_modules/php-parser/src/ast/traitprecedence.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");
const KIND = "traitprecedence";

/**
 * Defines a trait alias
 * @constructor TraitPrecedence
 * @extends {Node}
 * @property {Identifier|null} trait
 * @property {Identifier} method
 * @property {Identifier[]} instead
 */
module.exports = Node.extends(KIND, function TraitPrecedence(
  trait,
  method,
  instead,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.trait = trait;
  this.method = method;
  this.instead = instead;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/traituse.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/traituse.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(/*! ./node */ "./node_modules/php-parser/src/ast/node.js");
const KIND = "traituse";

/**
 * Defines a trait usage
 * @constructor TraitUse
 * @extends {Node}
 * @property {Identifier[]} traits
 * @property {Node[]|null} adaptations
 */
module.exports = Node.extends(KIND, function TraitUse(
  traits,
  adaptations,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.traits = traits;
  this.adaptations = adaptations;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/try.js":
/*!************************************************!*\
  !*** ./node_modules/php-parser/src/ast/try.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "try";

/**
 * Defines a try statement
 * @constructor Try
 * @extends {Statement}
 * @property {Block} body
 * @property {Catch[]} catches
 * @property {Block} allways
 */
module.exports = Statement.extends(KIND, function Try(
  body,
  catches,
  always,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.body = body;
  this.catches = catches;
  this.always = always;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/typereference.js":
/*!**********************************************************!*\
  !*** ./node_modules/php-parser/src/ast/typereference.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Reference = __webpack_require__(/*! ./reference */ "./node_modules/php-parser/src/ast/reference.js");
const KIND = "typereference";

/**
 * Defines a class reference node
 * @constructor TypeReference
 * @extends {Reference}
 * @property {string} name
 */
const TypeReference = Reference.extends(KIND, function TypeReference(
  name,
  raw,
  docs,
  location
) {
  Reference.apply(this, [KIND, docs, location]);
  this.name = name;
  this.raw = raw;
});

TypeReference.types = [
  "int",
  "float",
  "string",
  "bool",
  "object",
  "array",
  "callable",
  "iterable",
  "void",
];

module.exports = TypeReference;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/unary.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/unary.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Operation = __webpack_require__(/*! ./operation */ "./node_modules/php-parser/src/ast/operation.js");
const KIND = "unary";

/**
 * Unary operations
 * @constructor Unary
 * @extends {Operation}
 * @property {String} type
 * @property {Expression} what
 */
module.exports = Operation.extends(KIND, function Unary(
  type,
  what,
  docs,
  location
) {
  Operation.apply(this, [KIND, docs, location]);
  this.type = type;
  this.what = what;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/unset.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/unset.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "unset";

/**
 * Deletes references to a list of variables
 * @constructor Unset
 * @extends {Statement}
 */
module.exports = Statement.extends(KIND, function Unset(
  variables,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.variables = variables;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/usegroup.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/usegroup.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "usegroup";

/**
 * Defines a use statement (with a list of use items)
 * @constructor UseGroup
 * @extends {Statement}
 * @property {String|null} name
 * @property {String|null} type - Possible value : function, const
 * @property {UseItem[]} item
 * @see {Namespace}
 * @see http://php.net/manual/en/language.namespaces.importing.php
 */
module.exports = Statement.extends(KIND, function UseGroup(
  name,
  type,
  items,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.name = name;
  this.type = type;
  this.items = items;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/useitem.js":
/*!****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/useitem.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "useitem";

/**
 * Defines a use statement (from namespace)
 * @constructor UseItem
 * @extends {Statement}
 * @property {String} name
 * @property {String|null} type - Possible value : function, const
 * @property {Identifier|null} alias
 * @see {Namespace}
 * @see http://php.net/manual/en/language.namespaces.importing.php
 */
const UseItem = Statement.extends(KIND, function UseItem(
  name,
  alias,
  type,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.name = name;
  this.alias = alias;
  this.type = type;
});

/**
 * Importing a constant
 * @constant {String} TYPE_CONST
 */
UseItem.TYPE_CONST = "const";
/**
 * Importing a function
 * @constant {String} TYPE_FUNC
 */
UseItem.TYPE_FUNCTION = "function";

module.exports = UseItem;


/***/ }),

/***/ "./node_modules/php-parser/src/ast/variable.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/variable.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "variable";

/**
 * Any expression node. Since the left-hand side of an assignment may
 * be any expression in general, an expression can also be a pattern.
 * @constructor Variable
 * @extends {Expression}
 * @example
 * // PHP code :
 * $foo
 * // AST output
 * {
 *  "kind": "variable",
 *  "name": "foo",
 *  "curly": false
 * }
 * @property {String|Node} name The variable name (can be a complex expression when the name is resolved dynamically)
 * @property {boolean} curly Indicate if the name is defined between curlies, ex `${foo}`
 */
module.exports = Expression.extends(KIND, function Variable(
  name,
  curly,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.name = name;
  this.curly = curly || false;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/variadic.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/ast/variadic.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "variadic";

/**
 * Introduce a list of items into the arguments of the call
 * @constructor variadic
 * @extends {Expression}
 * @property {Array|Expression} what
 * @see https://wiki.php.net/rfc/argument_unpacking
 */
module.exports = Expression.extends(KIND, function variadic(
  what,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.what = what;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/while.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/while.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(/*! ./statement */ "./node_modules/php-parser/src/ast/statement.js");
const KIND = "while";

/**
 * Defines a while statement
 * @constructor While
 * @extends {Statement}
 * @property {Expression} test
 * @property {Statement} body
 * @property {boolean} shortForm
 */
module.exports = Statement.extends(KIND, function While(
  test,
  body,
  shortForm,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.test = test;
  this.body = body;
  this.shortForm = shortForm;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/yield.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/ast/yield.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "yield";

/**
 * Defines a yield generator statement
 * @constructor Yield
 * @extends {Expression}
 * @property {Expression|Null} value
 * @property {Expression|Null} key
 * @see http://php.net/manual/en/language.generators.syntax.php
 */
module.exports = Expression.extends(KIND, function Yield(
  value,
  key,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.value = value;
  this.key = key;
});


/***/ }),

/***/ "./node_modules/php-parser/src/ast/yieldfrom.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/ast/yieldfrom.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(/*! ./expression */ "./node_modules/php-parser/src/ast/expression.js");
const KIND = "yieldfrom";

/**
 * Defines a yield from generator statement
 * @constructor YieldFrom
 * @extends {Expression}
 * @property {Expression} value
 * @see http://php.net/manual/en/language.generators.syntax.php
 */
module.exports = Expression.extends(KIND, function YieldFrom(
  value,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.value = value;
});


/***/ }),

/***/ "./node_modules/php-parser/src/index.js":
/*!**********************************************!*\
  !*** ./node_modules/php-parser/src/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2020 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const lexer = __webpack_require__(/*! ./lexer */ "./node_modules/php-parser/src/lexer.js");
const parser = __webpack_require__(/*! ./parser */ "./node_modules/php-parser/src/parser.js");
const tokens = __webpack_require__(/*! ./tokens */ "./node_modules/php-parser/src/tokens.js");
const AST = __webpack_require__(/*! ./ast */ "./node_modules/php-parser/src/ast.js");

/**
 * @private
 */
function combine(src, to) {
  const keys = Object.keys(src);
  let i = keys.length;
  while (i--) {
    const k = keys[i];
    const val = src[k];
    if (val === null) {
      delete to[k];
    } else if (typeof val === "function") {
      to[k] = val.bind(to);
    } else if (Array.isArray(val)) {
      to[k] = Array.isArray(to[k]) ? to[k].concat(val) : val;
    } else if (typeof val === "object") {
      to[k] = typeof to[k] === "object" ? combine(val, to[k]) : val;
    } else {
      to[k] = val;
    }
  }
  return to;
}

/**
 * Initialise a new parser instance with the specified options
 *
 * @class
 * @tutorial Engine
 * @example
 * var parser = require('php-parser');
 * var instance = new parser({
 *   parser: {
 *     extractDoc: true,
 *     suppressErrors: true,
 *     version: 704 // or '7.4'
 *   },
 *   ast: {
 *     withPositions: true
 *   },
 *   lexer: {
 *     short_tags: true,
 *     asp_tags: true
 *   }
 * });
 *
 * var evalAST = instance.parseEval('some php code');
 * var codeAST = instance.parseCode('<?php some php code', 'foo.php');
 * var tokens = instance.tokenGetAll('<?php some php code');
 *
 * @param {Object} options - List of options
 * @property {Lexer} lexer
 * @property {Parser} parser
 * @property {AST} ast
 * @property {Object} tokens
 */
const engine = function (options) {
  if (typeof this === "function") {
    return new this(options);
  }
  this.tokens = tokens;
  this.lexer = new lexer(this);
  this.ast = new AST();
  this.parser = new parser(this.lexer, this.ast);
  if (options && typeof options === "object") {
    // disable php7 from lexer if already disabled from parser
    if (options.parser) {
      if (!options.lexer) {
        options.lexer = {};
      }
      if (options.parser.version) {
        if (typeof options.parser.version === "string") {
          let version = options.parser.version.split(".");
          version = parseInt(version[0]) * 100 + parseInt(version[1]);
          if (isNaN(version)) {
            throw new Error("Bad version number : " + options.parser.version);
          } else {
            options.parser.version = version;
          }
        } else if (typeof options.parser.version !== "number") {
          throw new Error("Expecting a number for version");
        }
        if (options.parser.version < 500 || options.parser.version > 704) {
          throw new Error("Can only handle versions between 5.x to 7.x");
        }
      }
    }
    combine(options, this);

    // same version flags based on parser options
    this.lexer.version = this.parser.version;
  }
};

/**
 * Check if the inpyt is a buffer or a string
 * @param  {Buffer|String} buffer Input value that can be either a buffer or a string
 * @return {String}   Returns the string from input
 */
const getStringBuffer = function (buffer) {
  return typeof buffer.write === "function" ? buffer.toString() : buffer;
};

/**
 * Creates a new instance (Helper)
 * @param {Object} options
 * @return {Engine}
 * @private
 */
engine.create = function (options) {
  return new engine(options);
};

/**
 * Evaluate the buffer
 * @private
 */
engine.parseEval = function (buffer, options) {
  const self = new engine(options);
  return self.parseEval(buffer);
};

/**
 * Parse an evaluating mode string (no need to open php tags)
 * @param {String} buffer
 * @return {Program}
 */
engine.prototype.parseEval = function (buffer) {
  this.lexer.mode_eval = true;
  this.lexer.all_tokens = false;
  buffer = getStringBuffer(buffer);
  return this.parser.parse(buffer, "eval");
};

/**
 * Static function that parse a php code with open/close tags
 * @private
 */
engine.parseCode = function (buffer, filename, options) {
  if (typeof filename === "object" && !options) {
    // retro-compatibility
    options = filename;
    filename = "unknown";
  }
  const self = new engine(options);
  return self.parseCode(buffer, filename);
};

/**
 * Function that parse a php code with open/close tags
 *
 * Sample code :
 * ```php
 * <?php $x = 1;
 * ```
 *
 * Usage :
 * ```js
 * var parser = require('php-parser');
 * var phpParser = new parser({
 *   // some options
 * });
 * var ast = phpParser.parseCode('...php code...', 'foo.php');
 * ```
 * @param {String} buffer - The code to be parsed
 * @param {String} filename - Filename
 * @return {Program}
 */
engine.prototype.parseCode = function (buffer, filename) {
  this.lexer.mode_eval = false;
  this.lexer.all_tokens = false;
  buffer = getStringBuffer(buffer);
  return this.parser.parse(buffer, filename);
};

/**
 * Split the buffer into tokens
 * @private
 */
engine.tokenGetAll = function (buffer, options) {
  const self = new engine(options);
  return self.tokenGetAll(buffer);
};

/**
 * Extract tokens from the specified buffer.
 * > Note that the output tokens are *STRICLY* similar to PHP function `token_get_all`
 * @param {String} buffer
 * @return {String[]} - Each item can be a string or an array with following informations [token_name, text, line_number]
 */
engine.prototype.tokenGetAll = function (buffer) {
  this.lexer.mode_eval = false;
  this.lexer.all_tokens = true;
  buffer = getStringBuffer(buffer);
  const EOF = this.lexer.EOF;
  const names = this.tokens.values;
  this.lexer.setInput(buffer);
  let token = this.lexer.lex() || EOF;
  const result = [];
  while (token != EOF) {
    let entry = this.lexer.yytext;
    if (names.hasOwnProperty(token)) {
      entry = [names[token], entry, this.lexer.yylloc.first_line];
    }
    result.push(entry);
    token = this.lexer.lex() || EOF;
  }
  return result;
};

// exports the function
module.exports = engine;

// makes libraries public
module.exports.tokens = tokens;
module.exports.lexer = lexer;
module.exports.AST = AST;
module.exports.parser = parser;
module.exports.combine = combine;

// allow the default export in index.d.ts
module.exports.default = engine;


/***/ }),

/***/ "./node_modules/php-parser/src/lexer.js":
/*!**********************************************!*\
  !*** ./node_modules/php-parser/src/lexer.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/**
 * This is the php lexer. It will tokenize the string for helping the
 * parser to build the AST from its grammar.
 *
 * @class
 * @property {Integer} EOF
 * @property {Boolean} all_tokens defines if all tokens must be retrieved (used by token_get_all only)
 * @property {Boolean} comment_tokens extracts comments tokens
 * @property {Boolean} mode_eval enables the evald mode (ignore opening tags)
 * @property {Boolean} asp_tags disables by default asp tags mode
 * @property {Boolean} short_tags enables by default short tags mode
 * @property {Object} keywords List of php keyword
 * @property {Object} castKeywords List of php keywords for type casting
 */
const lexer = function (engine) {
  this.engine = engine;
  this.tok = this.engine.tokens.names;
  this.EOF = 1;
  this.debug = false;
  this.all_tokens = true;
  this.comment_tokens = false;
  this.mode_eval = false;
  this.asp_tags = false;
  this.short_tags = false;
  this.version = 704;
  this.yyprevcol = 0;
  this.keywords = {
    __class__: this.tok.T_CLASS_C,
    __trait__: this.tok.T_TRAIT_C,
    __function__: this.tok.T_FUNC_C,
    __method__: this.tok.T_METHOD_C,
    __line__: this.tok.T_LINE,
    __file__: this.tok.T_FILE,
    __dir__: this.tok.T_DIR,
    __namespace__: this.tok.T_NS_C,
    exit: this.tok.T_EXIT,
    die: this.tok.T_EXIT,
    function: this.tok.T_FUNCTION,
    const: this.tok.T_CONST,
    return: this.tok.T_RETURN,
    try: this.tok.T_TRY,
    catch: this.tok.T_CATCH,
    finally: this.tok.T_FINALLY,
    throw: this.tok.T_THROW,
    if: this.tok.T_IF,
    elseif: this.tok.T_ELSEIF,
    endif: this.tok.T_ENDIF,
    else: this.tok.T_ELSE,
    while: this.tok.T_WHILE,
    endwhile: this.tok.T_ENDWHILE,
    do: this.tok.T_DO,
    for: this.tok.T_FOR,
    endfor: this.tok.T_ENDFOR,
    foreach: this.tok.T_FOREACH,
    endforeach: this.tok.T_ENDFOREACH,
    declare: this.tok.T_DECLARE,
    enddeclare: this.tok.T_ENDDECLARE,
    instanceof: this.tok.T_INSTANCEOF,
    as: this.tok.T_AS,
    switch: this.tok.T_SWITCH,
    endswitch: this.tok.T_ENDSWITCH,
    case: this.tok.T_CASE,
    default: this.tok.T_DEFAULT,
    break: this.tok.T_BREAK,
    continue: this.tok.T_CONTINUE,
    goto: this.tok.T_GOTO,
    echo: this.tok.T_ECHO,
    print: this.tok.T_PRINT,
    class: this.tok.T_CLASS,
    interface: this.tok.T_INTERFACE,
    trait: this.tok.T_TRAIT,
    extends: this.tok.T_EXTENDS,
    implements: this.tok.T_IMPLEMENTS,
    new: this.tok.T_NEW,
    clone: this.tok.T_CLONE,
    var: this.tok.T_VAR,
    eval: this.tok.T_EVAL,
    include: this.tok.T_INCLUDE,
    include_once: this.tok.T_INCLUDE_ONCE,
    require: this.tok.T_REQUIRE,
    require_once: this.tok.T_REQUIRE_ONCE,
    namespace: this.tok.T_NAMESPACE,
    use: this.tok.T_USE,
    insteadof: this.tok.T_INSTEADOF,
    global: this.tok.T_GLOBAL,
    isset: this.tok.T_ISSET,
    empty: this.tok.T_EMPTY,
    __halt_compiler: this.tok.T_HALT_COMPILER,
    static: this.tok.T_STATIC,
    abstract: this.tok.T_ABSTRACT,
    final: this.tok.T_FINAL,
    private: this.tok.T_PRIVATE,
    protected: this.tok.T_PROTECTED,
    public: this.tok.T_PUBLIC,
    unset: this.tok.T_UNSET,
    list: this.tok.T_LIST,
    array: this.tok.T_ARRAY,
    callable: this.tok.T_CALLABLE,
    or: this.tok.T_LOGICAL_OR,
    and: this.tok.T_LOGICAL_AND,
    xor: this.tok.T_LOGICAL_XOR,
  };
  this.castKeywords = {
    int: this.tok.T_INT_CAST,
    integer: this.tok.T_INT_CAST,
    real: this.tok.T_DOUBLE_CAST,
    double: this.tok.T_DOUBLE_CAST,
    float: this.tok.T_DOUBLE_CAST,
    string: this.tok.T_STRING_CAST,
    binary: this.tok.T_STRING_CAST,
    array: this.tok.T_ARRAY_CAST,
    object: this.tok.T_OBJECT_CAST,
    bool: this.tok.T_BOOL_CAST,
    boolean: this.tok.T_BOOL_CAST,
    unset: this.tok.T_UNSET_CAST,
  };
};

/**
 * Initialize the lexer with the specified input
 */
lexer.prototype.setInput = function (input) {
  this._input = input;
  this.size = input.length;
  this.yylineno = 1;
  this.offset = 0;
  this.yyprevcol = 0;
  this.yytext = "";
  this.yylloc = {
    first_offset: 0,
    first_line: 1,
    first_column: 0,
    prev_offset: 0,
    prev_line: 1,
    prev_column: 0,
    last_line: 1,
    last_column: 0,
  };
  this.tokens = [];
  if (this.version > 703) {
    this.keywords.fn = this.tok.T_FN;
  } else {
    delete this.keywords.fn;
  }
  this.done = this.offset >= this.size;
  if (!this.all_tokens && this.mode_eval) {
    this.conditionStack = ["INITIAL"];
    this.begin("ST_IN_SCRIPTING");
  } else {
    this.conditionStack = [];
    this.begin("INITIAL");
  }
  // https://github.com/php/php-src/blob/999e32b65a8a4bb59e27e538fa68ffae4b99d863/Zend/zend_language_scanner.h#L59
  // Used for heredoc and nowdoc
  this.heredoc_label = {
    label: "",
    length: 0,
    indentation: 0,
    indentation_uses_spaces: false,
    finished: false,
    /**
     * this used for parser to detemine the if current node segment is first encaps node.
     * if ture, the indentation will remove from the begining. and if false, the prev node
     * might be a variable '}' ,and the leading spaces should not be removed util meet the
     * first \n
     */
    first_encaps_node: false,
    // for backward compatible
    toString: function () {
      this.label;
    },
  };
  return this;
};

/**
 * consumes and returns one char from the input
 */
lexer.prototype.input = function () {
  const ch = this._input[this.offset];
  if (!ch) return "";
  this.yytext += ch;
  this.offset++;
  if (ch === "\r" && this._input[this.offset] === "\n") {
    this.yytext += "\n";
    this.offset++;
  }
  if (ch === "\n" || ch === "\r") {
    this.yylloc.last_line = ++this.yylineno;
    this.yyprevcol = this.yylloc.last_column;
    this.yylloc.last_column = 0;
  } else {
    this.yylloc.last_column++;
  }
  return ch;
};

/**
 * revert eating specified size
 */
lexer.prototype.unput = function (size) {
  if (size === 1) {
    // 1 char unput (most cases)
    this.offset--;
    if (
      this._input[this.offset] === "\n" &&
      this._input[this.offset - 1] === "\r"
    ) {
      this.offset--;
      size++;
    }
    if (
      this._input[this.offset] === "\r" ||
      this._input[this.offset] === "\n"
    ) {
      this.yylloc.last_line--;
      this.yylineno--;
      this.yylloc.last_column = this.yyprevcol;
    } else {
      this.yylloc.last_column--;
    }
    this.yytext = this.yytext.substring(0, this.yytext.length - size);
  } else if (size > 0) {
    this.offset -= size;
    if (size < this.yytext.length) {
      this.yytext = this.yytext.substring(0, this.yytext.length - size);
      // re-calculate position
      this.yylloc.last_line = this.yylloc.first_line;
      this.yylloc.last_column = this.yyprevcol = this.yylloc.first_column;
      for (let i = 0; i < this.yytext.length; i++) {
        let c = this.yytext[i];
        if (c === "\r") {
          c = this.yytext[++i];
          this.yyprevcol = this.yylloc.last_column;
          this.yylloc.last_line++;
          this.yylloc.last_column = 0;
          if (c !== "\n") {
            if (c === "\r") {
              this.yylloc.last_line++;
            } else {
              this.yylloc.last_column++;
            }
          }
        } else if (c === "\n") {
          this.yyprevcol = this.yylloc.last_column;
          this.yylloc.last_line++;
          this.yylloc.last_column = 0;
        } else {
          this.yylloc.last_column++;
        }
      }
      this.yylineno = this.yylloc.last_line;
    } else {
      // reset full text
      this.yytext = "";
      this.yylloc.last_line = this.yylineno = this.yylloc.first_line;
      this.yylloc.last_column = this.yylloc.first_column;
    }
  }

  return this;
};

// check if the text matches
lexer.prototype.tryMatch = function (text) {
  return text === this.ahead(text.length);
};

// check if the text matches
lexer.prototype.tryMatchCaseless = function (text) {
  return text === this.ahead(text.length).toLowerCase();
};

// look ahead
lexer.prototype.ahead = function (size) {
  let text = this._input.substring(this.offset, this.offset + size);
  if (
    text[text.length - 1] === "\r" &&
    this._input[this.offset + size + 1] === "\n"
  ) {
    text += "\n";
  }
  return text;
};

// consume the specified size
lexer.prototype.consume = function (size) {
  for (let i = 0; i < size; i++) {
    const ch = this._input[this.offset];
    if (!ch) break;
    this.yytext += ch;
    this.offset++;
    if (ch === "\r" && this._input[this.offset] === "\n") {
      this.yytext += "\n";
      this.offset++;
      i++;
    }
    if (ch === "\n" || ch === "\r") {
      this.yylloc.last_line = ++this.yylineno;
      this.yyprevcol = this.yylloc.last_column;
      this.yylloc.last_column = 0;
    } else {
      this.yylloc.last_column++;
    }
  }
  return this;
};

/**
 * Gets the current state
 */
lexer.prototype.getState = function () {
  return {
    yytext: this.yytext,
    offset: this.offset,
    yylineno: this.yylineno,
    yyprevcol: this.yyprevcol,
    yylloc: {
      first_offset: this.yylloc.first_offset,
      first_line: this.yylloc.first_line,
      first_column: this.yylloc.first_column,
      last_line: this.yylloc.last_line,
      last_column: this.yylloc.last_column,
    },
    heredoc_label: this.heredoc_label,
  };
};

/**
 * Sets the current lexer state
 */
lexer.prototype.setState = function (state) {
  this.yytext = state.yytext;
  this.offset = state.offset;
  this.yylineno = state.yylineno;
  this.yyprevcol = state.yyprevcol;
  this.yylloc = state.yylloc;
  if (state.heredoc_label) {
    this.heredoc_label = state.heredoc_label;
  }
  return this;
};

// prepend next token
lexer.prototype.appendToken = function (value, ahead) {
  this.tokens.push([value, ahead]);
  return this;
};

// return next match that has a token
lexer.prototype.lex = function () {
  this.yylloc.prev_offset = this.offset;
  this.yylloc.prev_line = this.yylloc.last_line;
  this.yylloc.prev_column = this.yylloc.last_column;
  let token = this.next() || this.lex();
  if (!this.all_tokens) {
    while (
      token === this.tok.T_WHITESPACE || // ignore white space
      (!this.comment_tokens &&
        (token === this.tok.T_COMMENT || // ignore single lines comments
          token === this.tok.T_DOC_COMMENT)) || // ignore doc comments
      // ignore open tags
      token === this.tok.T_OPEN_TAG
    ) {
      token = this.next() || this.lex();
    }
    if (token == this.tok.T_OPEN_TAG_WITH_ECHO) {
      // https://github.com/php/php-src/blob/7ff186434e82ee7be7c59d0db9a976641cf7b09c/Zend/zend_compile.c#L1683
      // open tag with echo statement
      return this.tok.T_ECHO;
    } else if (token === this.tok.T_CLOSE_TAG) {
      // https://github.com/php/php-src/blob/7ff186434e82ee7be7c59d0db9a976641cf7b09c/Zend/zend_compile.c#L1680
      return ";"; /* implicit ; */
    }
  }
  if (!this.yylloc.prev_offset) {
    this.yylloc.prev_offset = this.yylloc.first_offset;
    this.yylloc.prev_line = this.yylloc.first_line;
    this.yylloc.prev_column = this.yylloc.first_column;
  }
  /*else if (this.yylloc.prev_offset === this.offset && this.offset !== this.size) {
    throw new Error('Infinite loop @ ' + this.offset + ' / ' + this.size);
  }*/
  return token;
};

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
lexer.prototype.begin = function (condition) {
  this.conditionStack.push(condition);
  this.curCondition = condition;
  this.stateCb = this["match" + condition];
  if (typeof this.stateCb !== "function") {
    throw new Error('Undefined condition state "' + condition + '"');
  }
  return this;
};

// pop the previously active lexer condition state off the condition stack
lexer.prototype.popState = function () {
  const n = this.conditionStack.length - 1;
  const condition = n > 0 ? this.conditionStack.pop() : this.conditionStack[0];
  this.curCondition = this.conditionStack[this.conditionStack.length - 1];
  this.stateCb = this["match" + this.curCondition];
  if (typeof this.stateCb !== "function") {
    throw new Error('Undefined condition state "' + this.curCondition + '"');
  }
  return condition;
};

// return next match in input
lexer.prototype.next = function () {
  let token;
  if (!this._input) {
    this.done = true;
  }
  this.yylloc.first_offset = this.offset;
  this.yylloc.first_line = this.yylloc.last_line;
  this.yylloc.first_column = this.yylloc.last_column;
  this.yytext = "";
  if (this.done) {
    this.yylloc.prev_offset = this.yylloc.first_offset;
    this.yylloc.prev_line = this.yylloc.first_line;
    this.yylloc.prev_column = this.yylloc.first_column;
    return this.EOF;
  }
  if (this.tokens.length > 0) {
    token = this.tokens.shift();
    if (typeof token[1] === "object") {
      this.setState(token[1]);
    } else {
      this.consume(token[1]);
    }
    token = token[0];
  } else {
    token = this.stateCb.apply(this, []);
  }
  if (this.offset >= this.size && this.tokens.length === 0) {
    this.done = true;
  }
  if (this.debug) {
    let tName = token;
    if (typeof tName === "number") {
      tName = this.engine.tokens.values[tName];
    } else {
      tName = '"' + tName + '"';
    }
    const e = new Error(
      tName +
        "\tfrom " +
        this.yylloc.first_line +
        "," +
        this.yylloc.first_column +
        "\t - to " +
        this.yylloc.last_line +
        "," +
        this.yylloc.last_column +
        '\t"' +
        this.yytext +
        '"'
    );
    // eslint-disable-next-line no-console
    console.error(e.stack);
  }
  return token;
};

// extends the lexer with states
[
  __webpack_require__(/*! ./lexer/comments.js */ "./node_modules/php-parser/src/lexer/comments.js"),
  __webpack_require__(/*! ./lexer/initial.js */ "./node_modules/php-parser/src/lexer/initial.js"),
  __webpack_require__(/*! ./lexer/numbers.js */ "./node_modules/php-parser/src/lexer/numbers.js"),
  __webpack_require__(/*! ./lexer/property.js */ "./node_modules/php-parser/src/lexer/property.js"),
  __webpack_require__(/*! ./lexer/scripting.js */ "./node_modules/php-parser/src/lexer/scripting.js"),
  __webpack_require__(/*! ./lexer/strings.js */ "./node_modules/php-parser/src/lexer/strings.js"),
  __webpack_require__(/*! ./lexer/tokens.js */ "./node_modules/php-parser/src/lexer/tokens.js"),
  __webpack_require__(/*! ./lexer/utils.js */ "./node_modules/php-parser/src/lexer/utils.js"),
].forEach(function (ext) {
  for (const k in ext) {
    lexer.prototype[k] = ext[k];
  }
});

module.exports = lexer;


/***/ }),

/***/ "./node_modules/php-parser/src/lexer/comments.js":
/*!*******************************************************!*\
  !*** ./node_modules/php-parser/src/lexer/comments.js ***!
  \*******************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads a single line comment
   */
  T_COMMENT: function () {
    while (this.offset < this.size) {
      const ch = this.input();
      if (ch === "\n" || ch === "\r") {
        return this.tok.T_COMMENT;
      } else if (
        ch === "?" &&
        !this.aspTagMode &&
        this._input[this.offset] === ">"
      ) {
        this.unput(1);
        return this.tok.T_COMMENT;
      } else if (
        ch === "%" &&
        this.aspTagMode &&
        this._input[this.offset] === ">"
      ) {
        this.unput(1);
        return this.tok.T_COMMENT;
      }
    }
    return this.tok.T_COMMENT;
  },
  /**
   * Behaviour : https://github.com/php/php-src/blob/master/Zend/zend_language_scanner.l#L1927
   */
  T_DOC_COMMENT: function () {
    let ch = this.input();
    let token = this.tok.T_COMMENT;
    if (ch === "*") {
      // started with '/*' , check is next is '*'
      ch = this.input();
      if (this.is_WHITESPACE()) {
        // check if next is WHITESPACE
        token = this.tok.T_DOC_COMMENT;
      }
      if (ch === "/") {
        return token;
      } else {
        this.unput(1); // reset
      }
    }
    while (this.offset < this.size) {
      ch = this.input();
      if (ch === "*" && this._input[this.offset] === "/") {
        this.input();
        break;
      }
    }
    return token;
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/lexer/initial.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/lexer/initial.js ***!
  \******************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  nextINITIAL: function () {
    if (
      this.conditionStack.length > 1 &&
      this.conditionStack[this.conditionStack.length - 1] === "INITIAL"
    ) {
      // Return to HEREDOC/ST_DOUBLE_QUOTES mode
      this.popState();
    } else {
      this.begin("ST_IN_SCRIPTING");
    }
    return this;
  },
  matchINITIAL: function () {
    while (this.offset < this.size) {
      let ch = this.input();
      if (ch == "<") {
        ch = this.ahead(1);
        if (ch == "?") {
          if (this.tryMatch("?=")) {
            this.unput(1)
              .appendToken(this.tok.T_OPEN_TAG_WITH_ECHO, 3)
              .nextINITIAL();
            break;
          } else if (this.tryMatchCaseless("?php")) {
            ch = this._input[this.offset + 4];
            if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
              this.unput(1).appendToken(this.tok.T_OPEN_TAG, 6).nextINITIAL();
              break;
            }
          }
          if (this.short_tags) {
            this.unput(1).appendToken(this.tok.T_OPEN_TAG, 2).nextINITIAL();
            break;
          }
        } else if (this.asp_tags && ch == "%") {
          if (this.tryMatch("%=")) {
            this.aspTagMode = true;
            this.unput(1)
              .appendToken(this.tok.T_OPEN_TAG_WITH_ECHO, 3)
              .nextINITIAL();
            break;
          } else {
            this.aspTagMode = true;
            this.unput(1).appendToken(this.tok.T_OPEN_TAG, 2).nextINITIAL();
            break;
          }
        }
      }
    }
    if (this.yytext.length > 0) {
      return this.tok.T_INLINE_HTML;
    } else {
      return false;
    }
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/lexer/numbers.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/lexer/numbers.js ***!
  \******************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/* istanbul ignore else  */
let MAX_LENGTH_OF_LONG = 10;
let long_min_digits = "2147483648";
if (process.arch == "x64") {
  MAX_LENGTH_OF_LONG = 19;
  long_min_digits = "9223372036854775808";
}

module.exports = {
  consume_NUM: function () {
    let ch = this.yytext[0];
    let hasPoint = ch === ".";
    if (ch === "0") {
      ch = this.input();
      // check if hexa
      if (ch === "x" || ch === "X") {
        ch = this.input();
        if (ch !== "_" && this.is_HEX()) {
          return this.consume_HNUM();
        } else {
          this.unput(ch ? 2 : 1);
        }
        // check binary notation
      } else if (ch === "b" || ch === "B") {
        ch = this.input();
        if ((ch !== "_" && ch === "0") || ch === "1") {
          return this.consume_BNUM();
        } else {
          this.unput(ch ? 2 : 1);
        }
        // @fixme check octal notation ? not usefull
      } else if (!this.is_NUM()) {
        if (ch) this.unput(1);
      }
    }

    while (this.offset < this.size) {
      const prev = ch;
      ch = this.input();

      if (ch === "_") {
        if (prev === "_") {
          // restriction : next to underscore / 1__1;
          this.unput(2); // keep 1
          break;
        }
        if (prev === ".") {
          // next to decimal point  "1._0"
          this.unput(1); // keep 1.
          break;
        }
        if (prev === "e" || prev === "E") {
          // next to e "1e_10"
          this.unput(2); // keep 1
          break;
        }
      } else if (ch === ".") {
        if (hasPoint) {
          // no multiple points "1.0.5"
          this.unput(1); // keep 1.0
          break;
        }
        if (prev === "_") {
          // next to decimal point  "1_.0"
          this.unput(2); // keep 1
          break;
        }
        hasPoint = true;
        continue;
      } else if (ch === "e" || ch === "E") {
        if (prev === "_") {
          // next to e "1_e10"
          this.unput(1);
          break;
        }
        let undo = 2;
        ch = this.input();
        if (ch === "+" || ch === "-") {
          // 1e-5
          undo = 3;
          ch = this.input();
        }
        if (this.is_NUM_START()) {
          this.consume_LNUM();
          return this.tok.T_DNUMBER;
        }
        this.unput(ch ? undo : undo - 1); // keep only 1
        break;
      }

      if (!this.is_NUM()) {
        // example : 10.0a
        if (ch) this.unput(1); // keep 10.0
        break;
      }
    }

    if (hasPoint) {
      return this.tok.T_DNUMBER;
    } else if (this.yytext.length < MAX_LENGTH_OF_LONG - 1) {
      return this.tok.T_LNUMBER;
    } else {
      if (
        this.yytext.length < MAX_LENGTH_OF_LONG ||
        (this.yytext.length == MAX_LENGTH_OF_LONG &&
          this.yytext < long_min_digits)
      ) {
        return this.tok.T_LNUMBER;
      }
      return this.tok.T_DNUMBER;
    }
  },
  // read hexa
  consume_HNUM: function () {
    while (this.offset < this.size) {
      const ch = this.input();
      if (!this.is_HEX()) {
        if (ch) this.unput(1);
        break;
      }
    }
    return this.tok.T_LNUMBER;
  },
  // read a generic number
  consume_LNUM: function () {
    while (this.offset < this.size) {
      const ch = this.input();
      if (!this.is_NUM()) {
        if (ch) this.unput(1);
        break;
      }
    }
    return this.tok.T_LNUMBER;
  },
  // read binary
  consume_BNUM: function () {
    let ch;
    while (this.offset < this.size) {
      ch = this.input();
      if (ch !== "0" && ch !== "1" && ch !== "_") {
        if (ch) this.unput(1);
        break;
      }
    }
    return this.tok.T_LNUMBER;
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/lexer/property.js":
/*!*******************************************************!*\
  !*** ./node_modules/php-parser/src/lexer/property.js ***!
  \*******************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  matchST_LOOKING_FOR_PROPERTY: function () {
    let ch = this.input();
    if (ch === "-") {
      ch = this.input();
      if (ch === ">") {
        // https://github.com/php/php-src/blob/master/Zend/zend_language_scanner.l#L1296
        return this.tok.T_OBJECT_OPERATOR;
      }
      if (ch) this.unput(1);
    } else if (this.is_WHITESPACE()) {
      return this.tok.T_WHITESPACE;
    } else if (this.is_LABEL_START()) {
      // https://github.com/php/php-src/blob/master/Zend/zend_language_scanner.l#L1300
      this.consume_LABEL();
      this.popState();
      return this.tok.T_STRING;
    }
    // https://github.com/php/php-src/blob/master/Zend/zend_language_scanner.l#L1306
    this.popState();
    if (ch) this.unput(1);
    return false;
  },
  matchST_LOOKING_FOR_VARNAME: function () {
    let ch = this.input();

    // SHIFT STATE
    this.popState();
    this.begin("ST_IN_SCRIPTING");

    if (this.is_LABEL_START()) {
      this.consume_LABEL();
      ch = this.input();
      if (ch === "[" || ch === "}") {
        this.unput(1);
        return this.tok.T_STRING_VARNAME;
      } else {
        // any char (that's started with a label sequence)
        this.unput(this.yytext.length);
      }
    } else {
      // any char (thats not a label start sequence)
      if (ch) this.unput(1);
    }
    // stops looking for a varname and starts the scripting mode
    return false;
  },
  matchST_VAR_OFFSET: function () {
    const ch = this.input();
    if (this.is_NUM_START()) {
      this.consume_NUM();
      return this.tok.T_NUM_STRING;
    } else if (ch === "]") {
      this.popState();
      return "]";
    } else if (ch === "$") {
      this.input();
      if (this.is_LABEL_START()) {
        this.consume_LABEL();
        return this.tok.T_VARIABLE;
      } else {
        throw new Error("Unexpected terminal");
      }
    } else if (this.is_LABEL_START()) {
      this.consume_LABEL();
      return this.tok.T_STRING;
    } else if (
      this.is_WHITESPACE() ||
      ch === "\\" ||
      ch === "'" ||
      ch === "#"
    ) {
      return this.tok.T_ENCAPSED_AND_WHITESPACE;
    } else if (
      ch === "[" ||
      ch === "{" ||
      ch === "}" ||
      ch === '"' ||
      ch === "`" ||
      this.is_TOKEN()
    ) {
      return ch;
    } else {
      throw new Error("Unexpected terminal");
    }
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/lexer/scripting.js":
/*!********************************************************!*\
  !*** ./node_modules/php-parser/src/lexer/scripting.js ***!
  \********************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  matchST_IN_SCRIPTING: function () {
    let ch = this.input();
    switch (ch) {
      case " ":
      case "\t":
      case "\n":
      case "\r":
      case "\r\n":
        return this.T_WHITESPACE();
      case "#":
        return this.T_COMMENT();
      case "/":
        if (this._input[this.offset] === "/") {
          return this.T_COMMENT();
        } else if (this._input[this.offset] === "*") {
          this.input();
          return this.T_DOC_COMMENT();
        }
        return this.consume_TOKEN();
      case "'":
        return this.T_CONSTANT_ENCAPSED_STRING();
      case '"':
        return this.ST_DOUBLE_QUOTES();
      case "`":
        this.begin("ST_BACKQUOTE");
        return "`";
      case "?":
        if (!this.aspTagMode && this.tryMatch(">")) {
          this.input();
          const nextCH = this._input[this.offset];
          if (nextCH === "\n" || nextCH === "\r") this.input();
          if (this.conditionStack.length > 1) {
            this.begin("INITIAL");
          }
          return this.tok.T_CLOSE_TAG;
        }
        return this.consume_TOKEN();
      case "%":
        if (this.aspTagMode && this._input[this.offset] === ">") {
          this.input(); // consume the '>'
          ch = this._input[this.offset]; // read next
          if (ch === "\n" || ch === "\r") {
            this.input(); // consume the newline
          }
          this.aspTagMode = false;
          if (this.conditionStack.length > 1) {
            this.begin("INITIAL");
          }
          return this.tok.T_CLOSE_TAG;
        }
        return this.consume_TOKEN();
      case "{":
        this.begin("ST_IN_SCRIPTING");
        return "{";
      case "}":
        if (this.conditionStack.length > 2) {
          // Return to HEREDOC/ST_DOUBLE_QUOTES mode
          this.popState();
        }
        return "}";
      default:
        if (ch === ".") {
          ch = this.input();
          if (this.is_NUM_START()) {
            return this.consume_NUM();
          } else {
            if (ch) this.unput(1);
          }
        }
        if (this.is_NUM_START()) {
          return this.consume_NUM();
        } else if (this.is_LABEL_START()) {
          return this.consume_LABEL().T_STRING();
        } else if (this.is_TOKEN()) {
          return this.consume_TOKEN();
        }
    }
    throw new Error(
      'Bad terminal sequence "' +
        ch +
        '" at line ' +
        this.yylineno +
        " (offset " +
        this.offset +
        ")"
    );
  },

  T_WHITESPACE: function () {
    while (this.offset < this.size) {
      const ch = this.input();
      if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
        continue;
      }
      if (ch) this.unput(1);
      break;
    }
    return this.tok.T_WHITESPACE;
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/lexer/strings.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/lexer/strings.js ***!
  \******************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const newline = ["\n", "\r"];
const valid_after_heredoc = ["\n", "\r", ";"];
const valid_after_heredoc_73 = valid_after_heredoc.concat([
  "\t",
  " ",
  ",",
  "]",
  ")",
  "/",
  "=",
  "!",
]);

module.exports = {
  T_CONSTANT_ENCAPSED_STRING: function () {
    let ch;
    while (this.offset < this.size) {
      ch = this.input();
      if (ch == "\\") {
        this.input();
      } else if (ch == "'") {
        break;
      }
    }
    return this.tok.T_CONSTANT_ENCAPSED_STRING;
  },
  // check if matching a HEREDOC state
  is_HEREDOC: function () {
    const revert = this.offset;
    if (
      this._input[this.offset - 1] === "<" &&
      this._input[this.offset] === "<" &&
      this._input[this.offset + 1] === "<"
    ) {
      this.offset += 3;

      // optional tabs / spaces
      if (this.is_TABSPACE()) {
        while (this.offset < this.size) {
          this.offset++;
          if (!this.is_TABSPACE()) {
            break;
          }
        }
      }

      // optional quotes
      let tChar = this._input[this.offset - 1];
      if (tChar === "'" || tChar === '"') {
        this.offset++;
      } else {
        tChar = null;
      }

      // required label
      if (this.is_LABEL_START()) {
        let yyoffset = this.offset - 1;
        while (this.offset < this.size) {
          this.offset++;
          if (!this.is_LABEL()) {
            break;
          }
        }
        const yylabel = this._input.substring(yyoffset, this.offset - 1);
        if (!tChar || tChar === this._input[this.offset - 1]) {
          // required ending quote
          if (tChar) this.offset++;
          // require newline
          if (newline.includes(this._input[this.offset - 1])) {
            // go go go
            this.heredoc_label.label = yylabel;
            this.heredoc_label.length = yylabel.length;
            this.heredoc_label.finished = false;
            yyoffset = this.offset - revert;
            this.offset = revert;
            this.consume(yyoffset);
            if (tChar === "'") {
              this.begin("ST_NOWDOC");
            } else {
              this.begin("ST_HEREDOC");
            }
            // prematch to get the indentation information from end of doc
            this.prematch_ENDOFDOC();
            return this.tok.T_START_HEREDOC;
          }
        }
      }
    }
    this.offset = revert;
    return false;
  },
  ST_DOUBLE_QUOTES: function () {
    let ch;
    while (this.offset < this.size) {
      ch = this.input();
      if (ch == "\\") {
        this.input();
      } else if (ch == '"') {
        break;
      } else if (ch == "$") {
        ch = this.input();
        if (ch == "{" || this.is_LABEL_START()) {
          this.unput(2);
          break;
        }
        if (ch) this.unput(1);
      } else if (ch == "{") {
        ch = this.input();
        if (ch == "$") {
          this.unput(2);
          break;
        }
        if (ch) this.unput(1);
      }
    }
    if (ch == '"') {
      return this.tok.T_CONSTANT_ENCAPSED_STRING;
    } else {
      let prefix = 1;
      if (this.yytext[0] === "b" || this.yytext[0] === "B") {
        prefix = 2;
      }
      if (this.yytext.length > 2) {
        this.appendToken(
          this.tok.T_ENCAPSED_AND_WHITESPACE,
          this.yytext.length - prefix
        );
      }
      this.unput(this.yytext.length - prefix);
      this.begin("ST_DOUBLE_QUOTES");
      return this.yytext;
    }
  },

  // check if its a DOC end sequence
  isDOC_MATCH: function (offset, consumeLeadingSpaces) {
    // @fixme : check if out of text limits

    // consumeLeadingSpaces is false happen DOC prematch END HEREDOC stage.

    // Ensure current state is really after a new line break, not after a such as ${variables}
    const prev_ch = this._input[offset - 2];
    if (!newline.includes(prev_ch)) {
      return false;
    }

    // skip leading spaces or tabs
    let indentation_uses_spaces = false;
    let indentation_uses_tabs = false;
    // reset heredoc_label structure
    let indentation = 0;
    let leading_ch = this._input[offset - 1];

    if (this.version >= 703) {
      while (leading_ch === "\t" || leading_ch === " ") {
        if (leading_ch === " ") {
          indentation_uses_spaces = true;
        } else if (leading_ch === "\t") {
          indentation_uses_tabs = true;
        }

        leading_ch = this._input[offset + indentation];
        indentation++;
      }

      // Move offset to skip leading whitespace
      offset = offset + indentation;

      // return out if there was only whitespace on this line
      if (newline.includes(this._input[offset - 1])) {
        return false;
      }
    }

    if (
      this._input.substring(
        offset - 1,
        offset - 1 + this.heredoc_label.length
      ) === this.heredoc_label.label
    ) {
      const ch = this._input[offset - 1 + this.heredoc_label.length];
      if (
        (this.version >= 703
          ? valid_after_heredoc_73
          : valid_after_heredoc
        ).includes(ch)
      ) {
        if (consumeLeadingSpaces) {
          this.consume(indentation);
          // https://wiki.php.net/rfc/flexible_heredoc_nowdoc_syntaxes
          if (indentation_uses_spaces && indentation_uses_tabs) {
            throw new Error(
              "Parse error:  mixing spaces and tabs in ending marker at line " +
                this.yylineno +
                " (offset " +
                this.offset +
                ")"
            );
          }
        } else {
          // Called in prematch_ENDOFDOC
          this.heredoc_label.indentation = indentation;
          this.heredoc_label.indentation_uses_spaces = indentation_uses_spaces;
          this.heredoc_label.first_encaps_node = true;
        }
        return true;
      }
    }

    return false;
  },

  /**
   * Prematch the end of HEREDOC/NOWDOC end tag to preset the
   * context of this.heredoc_label
   */
  prematch_ENDOFDOC: function () {
    // reset heredoc
    this.heredoc_label.indentation_uses_spaces = false;
    this.heredoc_label.indentation = 0;
    this.heredoc_label.first_encaps_node = true;
    let offset = this.offset + 1;

    while (offset < this._input.length) {
      // if match heredoc_label structrue will be set
      if (this.isDOC_MATCH(offset, false)) {
        return;
      }

      if (!newline.includes(this._input[offset - 1])) {
        // skip one line
        while (
          !newline.includes(this._input[offset++]) &&
          offset < this._input.length
        ) {
          // skip
        }
      }

      offset++;
    }
  },

  matchST_NOWDOC: function () {
    /** edge case : empty now doc **/
    if (this.isDOC_MATCH(this.offset, true)) {
      // @fixme : never reached (may be caused by quotes)
      this.consume(this.heredoc_label.length);
      this.popState();
      return this.tok.T_END_HEREDOC;
    }
    /** SCANNING CONTENTS **/
    let ch = this._input[this.offset - 1];
    while (this.offset < this.size) {
      if (newline.includes(ch)) {
        ch = this.input();
        if (this.isDOC_MATCH(this.offset, true)) {
          this.unput(1).popState();
          this.appendToken(this.tok.T_END_HEREDOC, this.heredoc_label.length);
          return this.tok.T_ENCAPSED_AND_WHITESPACE;
        }
      } else {
        ch = this.input();
      }
    }
    // too bad ! reached end of document (will get a parse error)
    return this.tok.T_ENCAPSED_AND_WHITESPACE;
  },

  matchST_HEREDOC: function () {
    /** edge case : empty here doc **/
    let ch = this.input();
    if (this.isDOC_MATCH(this.offset, true)) {
      this.consume(this.heredoc_label.length - 1);
      this.popState();
      return this.tok.T_END_HEREDOC;
    }
    /** SCANNING CONTENTS **/
    while (this.offset < this.size) {
      if (ch === "\\") {
        ch = this.input(); // ignore next
        if (!newline.includes(ch)) {
          ch = this.input();
        }
      }

      if (newline.includes(ch)) {
        ch = this.input();
        if (this.isDOC_MATCH(this.offset, true)) {
          this.unput(1).popState();
          this.appendToken(this.tok.T_END_HEREDOC, this.heredoc_label.length);
          return this.tok.T_ENCAPSED_AND_WHITESPACE;
        }
      } else if (ch === "$") {
        ch = this.input();
        if (ch === "{") {
          // start of ${
          this.begin("ST_LOOKING_FOR_VARNAME");
          if (this.yytext.length > 2) {
            this.appendToken(this.tok.T_DOLLAR_OPEN_CURLY_BRACES, 2);
            this.unput(2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
          }
        } else if (this.is_LABEL_START()) {
          // start of $var...
          const yyoffset = this.offset;
          const next = this.consume_VARIABLE();
          if (this.yytext.length > this.offset - yyoffset + 2) {
            this.appendToken(next, this.offset - yyoffset + 2);
            this.unput(this.offset - yyoffset + 2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            return next;
          }
          //console.log(this.yytext);
        }
      } else if (ch === "{") {
        ch = this.input();
        if (ch === "$") {
          // start of {$...
          this.begin("ST_IN_SCRIPTING");
          if (this.yytext.length > 2) {
            this.appendToken(this.tok.T_CURLY_OPEN, 1);
            this.unput(2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            this.unput(1);
            return this.tok.T_CURLY_OPEN;
          }
        }
      } else {
        ch = this.input();
      }
    }

    // too bad ! reached end of document (will get a parse error)
    return this.tok.T_ENCAPSED_AND_WHITESPACE;
  },

  consume_VARIABLE: function () {
    this.consume_LABEL();
    const ch = this.input();
    if (ch == "[") {
      this.unput(1);
      this.begin("ST_VAR_OFFSET");
      return this.tok.T_VARIABLE;
    } else if (ch === "-") {
      if (this.input() === ">") {
        this.input();
        if (this.is_LABEL_START()) {
          this.begin("ST_LOOKING_FOR_PROPERTY");
        }
        this.unput(3);
        return this.tok.T_VARIABLE;
      } else {
        this.unput(2);
      }
    } else {
      if (ch) this.unput(1);
    }
    return this.tok.T_VARIABLE;
  },
  // HANDLES BACKQUOTES
  matchST_BACKQUOTE: function () {
    let ch = this.input();
    if (ch === "$") {
      ch = this.input();
      if (ch === "{") {
        this.begin("ST_LOOKING_FOR_VARNAME");
        return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
      } else if (this.is_LABEL_START()) {
        const tok = this.consume_VARIABLE();
        return tok;
      }
    } else if (ch === "{") {
      if (this._input[this.offset] === "$") {
        this.begin("ST_IN_SCRIPTING");
        return this.tok.T_CURLY_OPEN;
      }
    } else if (ch === "`") {
      this.popState();
      return "`";
    }

    // any char
    while (this.offset < this.size) {
      if (ch === "\\") {
        this.input();
      } else if (ch === "`") {
        this.unput(1);
        this.popState();
        this.appendToken("`", 1);
        break;
      } else if (ch === "$") {
        ch = this.input();
        if (ch === "{") {
          this.begin("ST_LOOKING_FOR_VARNAME");
          if (this.yytext.length > 2) {
            this.appendToken(this.tok.T_DOLLAR_OPEN_CURLY_BRACES, 2);
            this.unput(2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
          }
        } else if (this.is_LABEL_START()) {
          // start of $var...
          const yyoffset = this.offset;
          const next = this.consume_VARIABLE();
          if (this.yytext.length > this.offset - yyoffset + 2) {
            this.appendToken(next, this.offset - yyoffset + 2);
            this.unput(this.offset - yyoffset + 2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            return next;
          }
        }
        continue;
      } else if (ch === "{") {
        ch = this.input();
        if (ch === "$") {
          // start of {$...
          this.begin("ST_IN_SCRIPTING");
          if (this.yytext.length > 2) {
            this.appendToken(this.tok.T_CURLY_OPEN, 1);
            this.unput(2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            this.unput(1);
            return this.tok.T_CURLY_OPEN;
          }
        }
        continue;
      }
      ch = this.input();
    }
    return this.tok.T_ENCAPSED_AND_WHITESPACE;
  },

  matchST_DOUBLE_QUOTES: function () {
    let ch = this.input();
    if (ch === "$") {
      ch = this.input();
      if (ch === "{") {
        this.begin("ST_LOOKING_FOR_VARNAME");
        return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
      } else if (this.is_LABEL_START()) {
        const tok = this.consume_VARIABLE();
        return tok;
      }
    } else if (ch === "{") {
      if (this._input[this.offset] === "$") {
        this.begin("ST_IN_SCRIPTING");
        return this.tok.T_CURLY_OPEN;
      }
    } else if (ch === '"') {
      this.popState();
      return '"';
    }

    // any char
    while (this.offset < this.size) {
      if (ch === "\\") {
        this.input();
      } else if (ch === '"') {
        this.unput(1);
        this.popState();
        this.appendToken('"', 1);
        break;
      } else if (ch === "$") {
        ch = this.input();
        if (ch === "{") {
          this.begin("ST_LOOKING_FOR_VARNAME");
          if (this.yytext.length > 2) {
            this.appendToken(this.tok.T_DOLLAR_OPEN_CURLY_BRACES, 2);
            this.unput(2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
          }
        } else if (this.is_LABEL_START()) {
          // start of $var...
          const yyoffset = this.offset;
          const next = this.consume_VARIABLE();
          if (this.yytext.length > this.offset - yyoffset + 2) {
            this.appendToken(next, this.offset - yyoffset + 2);
            this.unput(this.offset - yyoffset + 2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            return next;
          }
        }
        if (ch) this.unput(1);
      } else if (ch === "{") {
        ch = this.input();
        if (ch === "$") {
          // start of {$...
          this.begin("ST_IN_SCRIPTING");
          if (this.yytext.length > 2) {
            this.appendToken(this.tok.T_CURLY_OPEN, 1);
            this.unput(2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            // @fixme : yytext = '"{$' (this.yytext.length > 3)
            this.unput(1);
            return this.tok.T_CURLY_OPEN;
          }
        }
        if (ch) this.unput(1);
      }
      ch = this.input();
    }
    return this.tok.T_ENCAPSED_AND_WHITESPACE;
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/lexer/tokens.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/lexer/tokens.js ***!
  \*****************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  T_STRING: function () {
    const token = this.yytext.toLowerCase();
    let id = this.keywords[token];
    if (typeof id !== "number") {
      if (token === "yield") {
        if (this.version >= 700 && this.tryMatch(" from")) {
          this.consume(5);
          id = this.tok.T_YIELD_FROM;
        } else {
          id = this.tok.T_YIELD;
        }
      } else {
        id = this.tok.T_STRING;
        if (token === "b" || token === "B") {
          const ch = this.input(1);
          if (ch === '"') {
            return this.ST_DOUBLE_QUOTES();
          } else if (ch === "'") {
            return this.T_CONSTANT_ENCAPSED_STRING();
          } else if (ch) {
            this.unput(1);
          }
        }
      }
    }
    return id;
  },
  // reads a custom token
  consume_TOKEN: function () {
    const ch = this._input[this.offset - 1];
    const fn = this.tokenTerminals[ch];
    if (fn) {
      return fn.apply(this, []);
    } else {
      return this.yytext;
    }
  },
  // list of special char tokens
  tokenTerminals: {
    $: function () {
      this.offset++;
      if (this.is_LABEL_START()) {
        this.offset--;
        this.consume_LABEL();
        return this.tok.T_VARIABLE;
      } else {
        this.offset--;
        return "$";
      }
    },
    "-": function () {
      const nchar = this._input[this.offset];
      if (nchar === ">") {
        this.begin("ST_LOOKING_FOR_PROPERTY").input();
        return this.tok.T_OBJECT_OPERATOR;
      } else if (nchar === "-") {
        this.input();
        return this.tok.T_DEC;
      } else if (nchar === "=") {
        this.input();
        return this.tok.T_MINUS_EQUAL;
      }
      return "-";
    },
    "\\": function () {
      return this.tok.T_NS_SEPARATOR;
    },
    "/": function () {
      if (this._input[this.offset] === "=") {
        this.input();
        return this.tok.T_DIV_EQUAL;
      }
      return "/";
    },
    ":": function () {
      if (this._input[this.offset] === ":") {
        this.input();
        return this.tok.T_DOUBLE_COLON;
      } else {
        return ":";
      }
    },
    "(": function () {
      const initial = this.offset;
      this.input();
      if (this.is_TABSPACE()) {
        this.consume_TABSPACE().input();
      }
      if (this.is_LABEL_START()) {
        const yylen = this.yytext.length;
        this.consume_LABEL();
        const castToken = this.yytext.substring(yylen - 1).toLowerCase();
        const castId = this.castKeywords[castToken];
        if (typeof castId === "number") {
          this.input();
          if (this.is_TABSPACE()) {
            this.consume_TABSPACE().input();
          }
          if (this._input[this.offset - 1] === ")") {
            return castId;
          }
        }
      }
      // revert the check
      this.unput(this.offset - initial);
      return "(";
    },
    "=": function () {
      const nchar = this._input[this.offset];
      if (nchar === ">") {
        this.input();
        return this.tok.T_DOUBLE_ARROW;
      } else if (nchar === "=") {
        if (this._input[this.offset + 1] === "=") {
          this.consume(2);
          return this.tok.T_IS_IDENTICAL;
        } else {
          this.input();
          return this.tok.T_IS_EQUAL;
        }
      }
      return "=";
    },
    "+": function () {
      const nchar = this._input[this.offset];
      if (nchar === "+") {
        this.input();
        return this.tok.T_INC;
      } else if (nchar === "=") {
        this.input();
        return this.tok.T_PLUS_EQUAL;
      }
      return "+";
    },
    "!": function () {
      if (this._input[this.offset] === "=") {
        if (this._input[this.offset + 1] === "=") {
          this.consume(2);
          return this.tok.T_IS_NOT_IDENTICAL;
        } else {
          this.input();
          return this.tok.T_IS_NOT_EQUAL;
        }
      }
      return "!";
    },
    "?": function () {
      if (this.version >= 700 && this._input[this.offset] === "?") {
        if (this.version >= 704 && this._input[this.offset + 1] === "=") {
          this.consume(2);
          return this.tok.T_COALESCE_EQUAL;
        } else {
          this.input();
          return this.tok.T_COALESCE;
        }
      }
      return "?";
    },
    "<": function () {
      let nchar = this._input[this.offset];
      if (nchar === "<") {
        nchar = this._input[this.offset + 1];
        if (nchar === "=") {
          this.consume(2);
          return this.tok.T_SL_EQUAL;
        } else if (nchar === "<") {
          if (this.is_HEREDOC()) {
            return this.tok.T_START_HEREDOC;
          }
        }
        this.input();
        return this.tok.T_SL;
      } else if (nchar === "=") {
        this.input();
        if (this.version >= 700 && this._input[this.offset] === ">") {
          this.input();
          return this.tok.T_SPACESHIP;
        } else {
          return this.tok.T_IS_SMALLER_OR_EQUAL;
        }
      } else if (nchar === ">") {
        this.input();
        return this.tok.T_IS_NOT_EQUAL;
      }
      return "<";
    },
    ">": function () {
      let nchar = this._input[this.offset];
      if (nchar === "=") {
        this.input();
        return this.tok.T_IS_GREATER_OR_EQUAL;
      } else if (nchar === ">") {
        nchar = this._input[this.offset + 1];
        if (nchar === "=") {
          this.consume(2);
          return this.tok.T_SR_EQUAL;
        } else {
          this.input();
          return this.tok.T_SR;
        }
      }
      return ">";
    },
    "*": function () {
      const nchar = this._input[this.offset];
      if (nchar === "=") {
        this.input();
        return this.tok.T_MUL_EQUAL;
      } else if (nchar === "*") {
        this.input();
        if (this._input[this.offset] === "=") {
          this.input();
          return this.tok.T_POW_EQUAL;
        } else {
          return this.tok.T_POW;
        }
      }
      return "*";
    },
    ".": function () {
      const nchar = this._input[this.offset];
      if (nchar === "=") {
        this.input();
        return this.tok.T_CONCAT_EQUAL;
      } else if (nchar === "." && this._input[this.offset + 1] === ".") {
        this.consume(2);
        return this.tok.T_ELLIPSIS;
      }
      return ".";
    },
    "%": function () {
      if (this._input[this.offset] === "=") {
        this.input();
        return this.tok.T_MOD_EQUAL;
      }
      return "%";
    },
    "&": function () {
      const nchar = this._input[this.offset];
      if (nchar === "=") {
        this.input();
        return this.tok.T_AND_EQUAL;
      } else if (nchar === "&") {
        this.input();
        return this.tok.T_BOOLEAN_AND;
      }
      return "&";
    },
    "|": function () {
      const nchar = this._input[this.offset];
      if (nchar === "=") {
        this.input();
        return this.tok.T_OR_EQUAL;
      } else if (nchar === "|") {
        this.input();
        return this.tok.T_BOOLEAN_OR;
      }
      return "|";
    },
    "^": function () {
      if (this._input[this.offset] === "=") {
        this.input();
        return this.tok.T_XOR_EQUAL;
      }
      return "^";
    },
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/lexer/utils.js":
/*!****************************************************!*\
  !*** ./node_modules/php-parser/src/lexer/utils.js ***!
  \****************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const tokens = ";:,.\\[]()|^&+-/*=%!~$<>?@";

module.exports = {
  // check if the char can be a numeric
  is_NUM: function () {
    const ch = this._input.charCodeAt(this.offset - 1);
    return (ch > 47 && ch < 58) || ch === 95;
  },

  // check if the char can be a numeric
  is_NUM_START: function () {
    const ch = this._input.charCodeAt(this.offset - 1);
    return ch > 47 && ch < 58;
  },

  // check if current char can be a label
  is_LABEL: function () {
    const ch = this._input.charCodeAt(this.offset - 1);
    return (
      (ch > 96 && ch < 123) ||
      (ch > 64 && ch < 91) ||
      ch === 95 ||
      (ch > 47 && ch < 58) ||
      ch > 126
    );
  },

  // check if current char can be a label
  is_LABEL_START: function () {
    const ch = this._input.charCodeAt(this.offset - 1);
    // A - Z
    if (ch > 64 && ch < 91) return true;
    // a - z
    if (ch > 96 && ch < 123) return true;
    // _ (95)
    if (ch === 95) return true;
    // utf8 / extended
    if (ch > 126) return true;
    // else
    return false;
  },

  // reads each char of the label
  consume_LABEL: function () {
    while (this.offset < this.size) {
      const ch = this.input();
      if (!this.is_LABEL()) {
        if (ch) this.unput(1);
        break;
      }
    }
    return this;
  },

  // check if current char is a token char
  is_TOKEN: function () {
    const ch = this._input[this.offset - 1];
    return tokens.indexOf(ch) !== -1;
  },
  // check if current char is a whitespace
  is_WHITESPACE: function () {
    const ch = this._input[this.offset - 1];
    return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
  },
  // check if current char is a whitespace (without newlines)
  is_TABSPACE: function () {
    const ch = this._input[this.offset - 1];
    return ch === " " || ch === "\t";
  },
  // consume all whitespaces (excluding newlines)
  consume_TABSPACE: function () {
    while (this.offset < this.size) {
      const ch = this.input();
      if (!this.is_TABSPACE()) {
        if (ch) this.unput(1);
        break;
      }
    }
    return this;
  },
  // check if current char can be a hexadecimal number
  is_HEX: function () {
    const ch = this._input.charCodeAt(this.offset - 1);
    // 0 - 9
    if (ch > 47 && ch < 58) return true;
    // A - F
    if (ch > 64 && ch < 71) return true;
    // a - f
    if (ch > 96 && ch < 103) return true;
    // _ (code 95)
    if (ch === 95) return true;
    // else
    return false;
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser.js":
/*!***********************************************!*\
  !*** ./node_modules/php-parser/src/parser.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/**
 * @private
 */
function isNumber(n) {
  return n != "." && n != "," && !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * The PHP Parser class that build the AST tree from the lexer
 *
 * @class
 * @tutorial Parser
 * @property {Lexer} lexer - current lexer instance
 * @property {AST} ast - the AST factory instance
 * @property {Integer|String} token - current token
 * @property {Boolean} extractDoc - should extract documentation as AST node
 * @property {Boolean} extractTokens - should extract each token
 * @property {Boolean} suppressErrors - should ignore parsing errors and continue
 * @property {Boolean} debug - should output debug informations
 */
const parser = function (lexer, ast) {
  this.lexer = lexer;
  this.ast = ast;
  this.tok = lexer.tok;
  this.EOF = lexer.EOF;
  this.token = null;
  this.prev = null;
  this.debug = false;
  this.version = 704;
  this.extractDoc = false;
  this.extractTokens = false;
  this.suppressErrors = false;
  const mapIt = function (item) {
    return [item, null];
  };
  this.entries = {
    // reserved_non_modifiers
    IDENTIFIER: new Map(
      [
        this.tok.T_ABSTRACT,
        this.tok.T_ARRAY,
        this.tok.T_AS,
        this.tok.T_BREAK,
        this.tok.T_CALLABLE,
        this.tok.T_CASE,
        this.tok.T_CATCH,
        this.tok.T_CLASS,
        this.tok.T_CLASS_C,
        this.tok.T_CLONE,
        this.tok.T_CONST,
        this.tok.T_CONTINUE,
        this.tok.T_DECLARE,
        this.tok.T_DEFAULT,
        this.tok.T_DIR,
        this.tok.T_DO,
        this.tok.T_ECHO,
        this.tok.T_ELSE,
        this.tok.T_ELSEIF,
        this.tok.T_EMPTY,
        this.tok.T_ENDDECLARE,
        this.tok.T_ENDFOR,
        this.tok.T_ENDFOREACH,
        this.tok.T_ENDIF,
        this.tok.T_ENDSWITCH,
        this.tok.T_ENDWHILE,
        this.tok.T_EVAL,
        this.tok.T_EXIT,
        this.tok.T_EXTENDS,
        this.tok.T_FILE,
        this.tok.T_FINAL,
        this.tok.T_FINALLY,
        this.tok.T_FN,
        this.tok.T_FOR,
        this.tok.T_FOREACH,
        this.tok.T_FUNC_C,
        this.tok.T_FUNCTION,
        this.tok.T_GLOBAL,
        this.tok.T_GOTO,
        this.tok.T_IF,
        this.tok.T_IMPLEMENTS,
        this.tok.T_INCLUDE,
        this.tok.T_INCLUDE_ONCE,
        this.tok.T_INSTANCEOF,
        this.tok.T_INSTEADOF,
        this.tok.T_INTERFACE,
        this.tok.T_ISSET,
        this.tok.T_LINE,
        this.tok.T_LIST,
        this.tok.T_LOGICAL_AND,
        this.tok.T_LOGICAL_OR,
        this.tok.T_LOGICAL_XOR,
        this.tok.T_METHOD_C,
        this.tok.T_NAMESPACE,
        this.tok.T_NEW,
        this.tok.T_NS_C,
        this.tok.T_PRINT,
        this.tok.T_PRIVATE,
        this.tok.T_PROTECTED,
        this.tok.T_PUBLIC,
        this.tok.T_REQUIRE,
        this.tok.T_REQUIRE_ONCE,
        this.tok.T_RETURN,
        this.tok.T_STATIC,
        this.tok.T_SWITCH,
        this.tok.T_THROW,
        this.tok.T_TRAIT,
        this.tok.T_TRY,
        this.tok.T_UNSET,
        this.tok.T_USE,
        this.tok.T_VAR,
        this.tok.T_WHILE,
        this.tok.T_YIELD,
      ].map(mapIt)
    ),
    VARIABLE: new Map(
      [
        this.tok.T_VARIABLE,
        "$",
        "&",
        this.tok.T_NS_SEPARATOR,
        this.tok.T_STRING,
        this.tok.T_NAMESPACE,
        this.tok.T_STATIC,
      ].map(mapIt)
    ),
    SCALAR: new Map(
      [
        this.tok.T_CONSTANT_ENCAPSED_STRING,
        this.tok.T_START_HEREDOC,
        this.tok.T_LNUMBER,
        this.tok.T_DNUMBER,
        this.tok.T_ARRAY,
        "[",
        this.tok.T_CLASS_C,
        this.tok.T_TRAIT_C,
        this.tok.T_FUNC_C,
        this.tok.T_METHOD_C,
        this.tok.T_LINE,
        this.tok.T_FILE,
        this.tok.T_DIR,
        this.tok.T_NS_C,
        '"',
        'b"',
        'B"',
        "-",
        this.tok.T_NS_SEPARATOR,
      ].map(mapIt)
    ),
    T_MAGIC_CONST: new Map(
      [
        this.tok.T_CLASS_C,
        this.tok.T_TRAIT_C,
        this.tok.T_FUNC_C,
        this.tok.T_METHOD_C,
        this.tok.T_LINE,
        this.tok.T_FILE,
        this.tok.T_DIR,
        this.tok.T_NS_C,
      ].map(mapIt)
    ),
    T_MEMBER_FLAGS: new Map(
      [
        this.tok.T_PUBLIC,
        this.tok.T_PRIVATE,
        this.tok.T_PROTECTED,
        this.tok.T_STATIC,
        this.tok.T_ABSTRACT,
        this.tok.T_FINAL,
      ].map(mapIt)
    ),
    EOS: new Map([";", this.EOF, this.tok.T_INLINE_HTML].map(mapIt)),
    EXPR: new Map(
      [
        "@",
        "-",
        "+",
        "!",
        "~",
        "(",
        "`",
        this.tok.T_LIST,
        this.tok.T_CLONE,
        this.tok.T_INC,
        this.tok.T_DEC,
        this.tok.T_NEW,
        this.tok.T_ISSET,
        this.tok.T_EMPTY,
        this.tok.T_INCLUDE,
        this.tok.T_INCLUDE_ONCE,
        this.tok.T_REQUIRE,
        this.tok.T_REQUIRE_ONCE,
        this.tok.T_EVAL,
        this.tok.T_INT_CAST,
        this.tok.T_DOUBLE_CAST,
        this.tok.T_STRING_CAST,
        this.tok.T_ARRAY_CAST,
        this.tok.T_OBJECT_CAST,
        this.tok.T_BOOL_CAST,
        this.tok.T_UNSET_CAST,
        this.tok.T_EXIT,
        this.tok.T_PRINT,
        this.tok.T_YIELD,
        this.tok.T_STATIC,
        this.tok.T_FUNCTION,
        this.tok.T_FN,
        // using VARIABLES :
        this.tok.T_VARIABLE,
        "$",
        this.tok.T_NS_SEPARATOR,
        this.tok.T_STRING,
        // using SCALAR :
        this.tok.T_STRING, // @see variable.js line 45 > conflict with variable = shift/reduce :)
        this.tok.T_CONSTANT_ENCAPSED_STRING,
        this.tok.T_START_HEREDOC,
        this.tok.T_LNUMBER,
        this.tok.T_DNUMBER,
        this.tok.T_ARRAY,
        "[",
        this.tok.T_CLASS_C,
        this.tok.T_TRAIT_C,
        this.tok.T_FUNC_C,
        this.tok.T_METHOD_C,
        this.tok.T_LINE,
        this.tok.T_FILE,
        this.tok.T_DIR,
        this.tok.T_NS_C,
        '"',
        'b"',
        'B"',
        "-",
        this.tok.T_NS_SEPARATOR,
      ].map(mapIt)
    ),
  };
};

/**
 * helper : gets a token name
 */
parser.prototype.getTokenName = function (token) {
  if (!isNumber(token)) {
    return "'" + token + "'";
  } else {
    if (token == this.EOF) return "the end of file (EOF)";
    return this.lexer.engine.tokens.values[token];
  }
};

/**
 * main entry point : converts a source code to AST
 */
parser.prototype.parse = function (code, filename) {
  this._errors = [];
  this.filename = filename || "eval";
  this.currentNamespace = [""];
  if (this.extractDoc) {
    this._docs = [];
  } else {
    this._docs = null;
  }
  if (this.extractTokens) {
    this._tokens = [];
  } else {
    this._tokens = null;
  }
  this._docIndex = 0;
  this._lastNode = null;
  this.lexer.setInput(code);
  this.lexer.all_tokens = this.extractTokens;
  this.lexer.comment_tokens = this.extractDoc;
  this.length = this.lexer._input.length;
  this.innerList = false;
  this.innerListForm = false;
  const program = this.node("program");
  const childs = [];
  this.next();
  while (this.token != this.EOF) {
    childs.push(this.read_start());
  }
  // append last comment
  if (
    childs.length === 0 &&
    this.extractDoc &&
    this._docs.length > this._docIndex
  ) {
    childs.push(this.node("noop")());
  }
  // #176 : register latest position
  this.prev = [
    this.lexer.yylloc.last_line,
    this.lexer.yylloc.last_column,
    this.lexer.offset,
  ];
  const result = program(childs, this._errors, this._docs, this._tokens);
  if (this.debug) {
    const errors = this.ast.checkNodes();
    if (errors.length > 0) {
      errors.forEach(function (error) {
        if (error.position) {
          // eslint-disable-next-line no-console
          console.log(
            "Node at line " +
              error.position.line +
              ", column " +
              error.position.column
          );
        }
        // eslint-disable-next-line no-console
        console.log(error.stack.join("\n"));
      });
      throw new Error("Some nodes are not closed");
    }
  }
  return result;
};

/**
 * Raise an error
 */
parser.prototype.raiseError = function (message, msgExpect, expect, token) {
  message += " on line " + this.lexer.yylloc.first_line;
  if (!this.suppressErrors) {
    const err = new SyntaxError(
      message,
      this.filename,
      this.lexer.yylloc.first_line
    );
    err.lineNumber = this.lexer.yylloc.first_line;
    err.fileName = this.filename;
    err.columnNumber = this.lexer.yylloc.first_column;
    throw err;
  }
  // Error node :
  const node = this.ast.prepare("error", null, this)(
    message,
    token,
    this.lexer.yylloc.first_line,
    expect
  );
  this._errors.push(node);
  return node;
};

/**
 * handling errors
 */
parser.prototype.error = function (expect) {
  let msg = "Parse Error : syntax error";
  let token = this.getTokenName(this.token);
  let msgExpect = "";

  if (this.token !== this.EOF) {
    if (isNumber(this.token)) {
      let symbol = this.text();
      if (symbol.length > 10) {
        symbol = symbol.substring(0, 7) + "...";
      }
      token = "'" + symbol + "' (" + token + ")";
    }
    msg += ", unexpected " + token;
  }
  if (expect && !Array.isArray(expect)) {
    if (isNumber(expect) || expect.length === 1) {
      msgExpect = ", expecting " + this.getTokenName(expect);
    }
    msg += msgExpect;
  }
  return this.raiseError(msg, msgExpect, expect, token);
};

/**
 * Creates a new AST node
 */
parser.prototype.node = function (name) {
  if (this.extractDoc) {
    let docs = null;
    if (this._docIndex < this._docs.length) {
      docs = this._docs.slice(this._docIndex);
      this._docIndex = this._docs.length;
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.log(new Error("Append docs on " + name));
        // eslint-disable-next-line no-console
        console.log(docs);
      }
    }
    const node = this.ast.prepare(name, docs, this);
    /**
     * TOKENS :
     * node1 commentA token commmentB node2 commentC token commentD node3 commentE token
     *
     * AST :
     * structure:S1 [
     *    left: node1 ( trail: commentA ),
     *    right: structure:S2 [
     *       node2 (lead: commentB, trail: commentC),
     *       node3 (lead: commentD)
     *    ],
     *    trail: commentE
     * ]
     *
     * Algorithm :
     *
     * Attach the last comments on parent of current node
     * If a new node is started and the parent has a trailing comment
     * the move it on previous node
     *
     * start S2
     * start node1
     * consume node1 & set commentA as trailingComment on S2
     * start S2
     * S1 has a trailingComment, attach it on node1
     * ...
     * NOTE : As the trailingComment Behavior depends on AST, it will be build on
     * the AST layer - last child node will keep it's trailingComment nodes
     */
    node.postBuild = function (self) {
      if (this._docIndex < this._docs.length) {
        if (this._lastNode) {
          const offset = this.prev[2];
          let max = this._docIndex;
          for (; max < this._docs.length; max++) {
            if (this._docs[max].offset > offset) {
              break;
            }
          }
          if (max > this._docIndex) {
            // inject trailing comment on child node
            this._lastNode.setTrailingComments(
              this._docs.slice(this._docIndex, max)
            );
            this._docIndex = max;
          }
        } else if (this.token === this.EOF) {
          // end of content
          self.setTrailingComments(this._docs.slice(this._docIndex));
          this._docIndex = this._docs.length;
        }
      }
      this._lastNode = self;
    }.bind(this);
    return node;
  }
  return this.ast.prepare(name, null, this);
};

/**
 * expects an end of statement or end of file
 * @return {boolean}
 */
parser.prototype.expectEndOfStatement = function (node) {
  if (this.token === ";") {
    // include only real ';' statements
    // https://github.com/glayzzle/php-parser/issues/164
    if (node && this.lexer.yytext === ";") {
      node.includeToken(this);
    }
  } else if (this.token !== this.tok.T_INLINE_HTML && this.token !== this.EOF) {
    this.error(";");
    return false;
  }
  this.next();
  return true;
};

/** outputs some debug information on current token **/
const ignoreStack = ["parser.next", "parser.node", "parser.showlog"];
parser.prototype.showlog = function () {
  const stack = new Error().stack.split("\n");
  let line;
  for (let offset = 2; offset < stack.length; offset++) {
    line = stack[offset].trim();
    let found = false;
    for (let i = 0; i < ignoreStack.length; i++) {
      if (line.substring(3, 3 + ignoreStack[i].length) === ignoreStack[i]) {
        found = true;
        break;
      }
    }
    if (!found) {
      break;
    }
  }
  // eslint-disable-next-line no-console
  console.log(
    "Line " +
      this.lexer.yylloc.first_line +
      " : " +
      this.getTokenName(this.token) +
      ">" +
      this.lexer.yytext +
      "<" +
      " @-->" +
      line
  );
  return this;
};

/**
 * Force the parser to check the current token.
 *
 * If the current token does not match to expected token,
 * the an error will be raised.
 *
 * If the suppressError mode is activated, then the error will
 * be added to the program error stack and this function will return `false`.
 *
 * @param {String|Number} token
 * @return {boolean}
 * @throws Error
 */
parser.prototype.expect = function (token) {
  if (Array.isArray(token)) {
    if (token.indexOf(this.token) === -1) {
      this.error(token);
      return false;
    }
  } else if (this.token != token) {
    this.error(token);
    return false;
  }
  return true;
};

/**
 * Returns the current token contents
 * @return {String}
 */
parser.prototype.text = function () {
  return this.lexer.yytext;
};

/** consume the next token **/
parser.prototype.next = function () {
  // prepare the back command
  if (this.token !== ";" || this.lexer.yytext === ";") {
    // ignore '?>' from automated resolution
    // https://github.com/glayzzle/php-parser/issues/168
    this.prev = [
      this.lexer.yylloc.last_line,
      this.lexer.yylloc.last_column,
      this.lexer.offset,
    ];
  }

  // eating the token
  this.lex();

  // showing the debug
  if (this.debug) {
    this.showlog();
  }

  // handling comments
  if (this.extractDoc) {
    while (
      this.token === this.tok.T_COMMENT ||
      this.token === this.tok.T_DOC_COMMENT
    ) {
      // APPEND COMMENTS
      if (this.token === this.tok.T_COMMENT) {
        this._docs.push(this.read_comment());
      } else {
        this._docs.push(this.read_doc_comment());
      }
    }
  }

  return this;
};

/**
 * Eating a token
 */
parser.prototype.lex = function () {
  // append on token stack
  if (this.extractTokens) {
    do {
      // the token
      this.token = this.lexer.lex() || this.EOF;
      if (this.token === this.EOF) return this;
      let entry = this.lexer.yytext;
      if (this.lexer.engine.tokens.values.hasOwnProperty(this.token)) {
        entry = [
          this.lexer.engine.tokens.values[this.token],
          entry,
          this.lexer.yylloc.first_line,
          this.lexer.yylloc.first_offset,
          this.lexer.offset,
        ];
      } else {
        entry = [
          null,
          entry,
          this.lexer.yylloc.first_line,
          this.lexer.yylloc.first_offset,
          this.lexer.offset,
        ];
      }
      this._tokens.push(entry);
      if (this.token === this.tok.T_CLOSE_TAG) {
        // https://github.com/php/php-src/blob/7ff186434e82ee7be7c59d0db9a976641cf7b09c/Zend/zend_compile.c#L1680
        this.token = ";";
        return this;
      } else if (this.token === this.tok.T_OPEN_TAG_WITH_ECHO) {
        this.token = this.tok.T_ECHO;
        return this;
      }
    } while (
      this.token === this.tok.T_WHITESPACE || // ignore white space
      (!this.extractDoc &&
        (this.token === this.tok.T_COMMENT || // ignore single lines comments
          this.token === this.tok.T_DOC_COMMENT)) || // ignore doc comments
      // ignore open tags
      this.token === this.tok.T_OPEN_TAG
    );
  } else {
    this.token = this.lexer.lex() || this.EOF;
  }
  return this;
};

/**
 * Check if token is of specified type
 */
parser.prototype.is = function (type) {
  if (Array.isArray(type)) {
    return type.indexOf(this.token) !== -1;
  }
  return this.entries[type].has(this.token);
};

// extends the parser with syntax files
[
  __webpack_require__(/*! ./parser/array.js */ "./node_modules/php-parser/src/parser/array.js"),
  __webpack_require__(/*! ./parser/class.js */ "./node_modules/php-parser/src/parser/class.js"),
  __webpack_require__(/*! ./parser/comment.js */ "./node_modules/php-parser/src/parser/comment.js"),
  __webpack_require__(/*! ./parser/expr.js */ "./node_modules/php-parser/src/parser/expr.js"),
  __webpack_require__(/*! ./parser/function.js */ "./node_modules/php-parser/src/parser/function.js"),
  __webpack_require__(/*! ./parser/if.js */ "./node_modules/php-parser/src/parser/if.js"),
  __webpack_require__(/*! ./parser/loops.js */ "./node_modules/php-parser/src/parser/loops.js"),
  __webpack_require__(/*! ./parser/main.js */ "./node_modules/php-parser/src/parser/main.js"),
  __webpack_require__(/*! ./parser/namespace.js */ "./node_modules/php-parser/src/parser/namespace.js"),
  __webpack_require__(/*! ./parser/scalar.js */ "./node_modules/php-parser/src/parser/scalar.js"),
  __webpack_require__(/*! ./parser/statement.js */ "./node_modules/php-parser/src/parser/statement.js"),
  __webpack_require__(/*! ./parser/switch.js */ "./node_modules/php-parser/src/parser/switch.js"),
  __webpack_require__(/*! ./parser/try.js */ "./node_modules/php-parser/src/parser/try.js"),
  __webpack_require__(/*! ./parser/utils.js */ "./node_modules/php-parser/src/parser/utils.js"),
  __webpack_require__(/*! ./parser/variable.js */ "./node_modules/php-parser/src/parser/variable.js"),
].forEach(function (ext) {
  for (const k in ext) {
    if (parser.prototype.hasOwnProperty(k)) {
      // @see https://github.com/glayzzle/php-parser/issues/234
      throw new Error("Function " + k + " is already defined - collision");
    }
    parser.prototype[k] = ext[k];
  }
});

module.exports = parser;


/***/ }),

/***/ "./node_modules/php-parser/src/parser/array.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/parser/array.js ***!
  \*****************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Parse an array
   * ```ebnf
   * array ::= T_ARRAY '(' array_pair_list ')' |
   *   '[' array_pair_list ']'
   * ```
   */
  read_array: function () {
    let expect = null;
    let shortForm = false;
    const result = this.node("array");

    if (this.token === this.tok.T_ARRAY) {
      this.next().expect("(");
      expect = ")";
    } else {
      shortForm = true;
      expect = "]";
    }
    let items = [];
    if (this.next().token !== expect) {
      items = this.read_array_pair_list(shortForm);
    }
    this.expect(expect);
    this.next();
    return result(shortForm, items);
  },
  /**
   * Reads an array of items
   * ```ebnf
   * array_pair_list ::= array_pair (',' array_pair?)*
   * ```
   */
  read_array_pair_list: function (shortForm) {
    const self = this;
    return this.read_list(
      function () {
        return self.read_array_pair(shortForm);
      },
      ",",
      true
    );
  },
  /**
   * Reads an entry
   * array_pair:
   *  expr T_DOUBLE_ARROW expr
   *  | expr
   *  | expr T_DOUBLE_ARROW '&' variable
   *  | '&' variable
   *  | expr T_DOUBLE_ARROW T_LIST '(' array_pair_list ')'
   *  | T_LIST '(' array_pair_list ')'
   */
  read_array_pair: function (shortForm) {
    if (
      (!shortForm && this.token === ")") ||
      (shortForm && this.token === "]")
    ) {
      return;
    }

    if (this.token === ",") {
      return this.node("noop")();
    }

    const entry = this.node("entry");

    let key = null;
    let value = null;
    let byRef = false;
    let unpack = false;

    if (this.token === "&") {
      this.next();
      byRef = true;
      value = this.read_variable(true, false);
    } else if (this.token === this.tok.T_ELLIPSIS && this.version >= 704) {
      this.next();
      if (this.token === "&") {
        this.error();
      }
      unpack = true;
      value = this.read_expr();
    } else {
      const expr = this.read_expr();

      if (this.token === this.tok.T_DOUBLE_ARROW) {
        this.next();
        key = expr;

        if (this.token === "&") {
          this.next();
          byRef = true;
          value = this.read_variable(true, false);
        } else {
          value = this.read_expr();
        }
      } else {
        value = expr;
      }
    }

    return entry(key, value, byRef, unpack);
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/class.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/parser/class.js ***!
  \*****************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * reading a class
   * ```ebnf
   * class ::= class_scope? T_CLASS T_STRING (T_EXTENDS NAMESPACE_NAME)? (T_IMPLEMENTS (NAMESPACE_NAME ',')* NAMESPACE_NAME)? '{' CLASS_BODY '}'
   * ```
   */
  read_class_declaration_statement: function () {
    const result = this.node("class");
    const flag = this.read_class_modifiers();
    // graceful mode : ignore token & go next
    if (this.token !== this.tok.T_CLASS) {
      this.error(this.tok.T_CLASS);
      this.next();
      return null;
    }
    this.next().expect(this.tok.T_STRING);
    let propName = this.node("identifier");
    const name = this.text();
    this.next();
    propName = propName(name);
    const propExtends = this.read_extends_from();
    const propImplements = this.read_implements_list();
    this.expect("{");
    const body = this.next().read_class_body();
    return result(propName, propExtends, propImplements, body, flag);
  },

  read_class_modifiers: function () {
    return [0, 0, this.read_class_modifier()];
  },

  read_class_modifier: function () {
    const result = 0;

    if (this.token === this.tok.T_ABSTRACT) {
      this.next();
      return 1;
    } else if (this.token === this.tok.T_FINAL) {
      this.next();
      return 2;
    }

    return result;
  },

  /**
   * Reads a class body
   * ```ebnf
   *   class_body ::= (member_flags? (T_VAR | T_STRING | T_FUNCTION))*
   * ```
   */
  read_class_body: function () {
    let result = [];

    while (this.token !== this.EOF && this.token !== "}") {
      if (this.token === this.tok.T_COMMENT) {
        result.push(this.read_comment());
        continue;
      }

      if (this.token === this.tok.T_DOC_COMMENT) {
        result.push(this.read_doc_comment());
        continue;
      }

      // check T_USE trait
      if (this.token === this.tok.T_USE) {
        result = result.concat(this.read_trait_use_statement());
        continue;
      }

      // read member flags
      const flags = this.read_member_flags(false);

      // check constant
      if (this.token === this.tok.T_CONST) {
        const constants = this.read_constant_list(flags);
        if (this.expect(";")) {
          this.next();
        }
        result = result.concat(constants);
        continue;
      }

      // jump over T_VAR then land on T_VARIABLE
      if (this.token === this.tok.T_VAR) {
        this.next().expect(this.tok.T_VARIABLE);
        flags[0] = null; // public (as null)
        flags[1] = 0; // non static var
      }

      if (this.token === this.tok.T_FUNCTION) {
        // reads a function
        result.push(this.read_function(false, flags));
      } else if (
        this.token === this.tok.T_VARIABLE ||
        // support https://wiki.php.net/rfc/typed_properties_v2
        (this.version >= 704 &&
          (this.token === "?" ||
            this.token === this.tok.T_CALLABLE ||
            this.token === this.tok.T_ARRAY ||
            this.token === this.tok.T_NS_SEPARATOR ||
            this.token === this.tok.T_STRING ||
            this.token === this.tok.T_NAMESPACE))
      ) {
        // reads a variable
        const variables = this.read_variable_list(flags);
        this.expect(";");
        this.next();
        result = result.concat(variables);
      } else {
        // raise an error
        this.error([
          this.tok.T_CONST,
          this.tok.T_VARIABLE,
          this.tok.T_FUNCTION,
        ]);
        // ignore token
        this.next();
      }
    }
    this.expect("}");
    this.next();
    return result;
  },
  /**
   * Reads variable list
   * ```ebnf
   *  variable_list ::= (variable_declaration ',')* variable_declaration
   * ```
   */
  read_variable_list: function (flags) {
    const result = this.node("propertystatement");

    const properties = this.read_list(
      /**
       * Reads a variable declaration
       *
       * ```ebnf
       *  variable_declaration ::= T_VARIABLE '=' scalar
       * ```
       */
      function read_variable_declaration() {
        const result = this.node("property");
        const [nullable, type] = this.read_optional_type();
        this.expect(this.tok.T_VARIABLE);
        let propName = this.node("identifier");
        const name = this.text().substring(1); // ignore $
        this.next();
        propName = propName(name);
        if (this.token === ";" || this.token === ",") {
          return result(propName, null, nullable, type);
        } else if (this.token === "=") {
          // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L815
          return result(propName, this.next().read_expr(), nullable, type);
        } else {
          this.expect([",", ";", "="]);
          return result(propName, null, nullable, type);
        }
      },
      ","
    );

    return result(null, properties, flags);
  },
  /**
   * Reads constant list
   * ```ebnf
   *  constant_list ::= T_CONST (constant_declaration ',')* constant_declaration
   * ```
   */
  read_constant_list: function (flags) {
    if (this.expect(this.tok.T_CONST)) {
      this.next();
    }
    const result = this.node("classconstant");
    const items = this.read_list(
      /**
       * Reads a constant declaration
       *
       * ```ebnf
       *  constant_declaration ::= (T_STRING | IDENTIFIER) '=' expr
       * ```
       * @return {Constant} [:link:](AST.md#constant)
       */
      function read_constant_declaration() {
        const result = this.node("constant");
        let constName = null;
        let value = null;
        if (
          this.token === this.tok.T_STRING ||
          (this.version >= 700 && this.is("IDENTIFIER"))
        ) {
          constName = this.node("identifier");
          const name = this.text();
          this.next();
          constName = constName(name);
        } else {
          this.expect("IDENTIFIER");
        }
        if (this.expect("=")) {
          value = this.next().read_expr();
        }
        return result(constName, value);
      },
      ","
    );

    return result(null, items, flags);
  },
  /**
   * Read member flags
   * @return array
   *  1st index : 0 => public, 1 => protected, 2 => private
   *  2nd index : 0 => instance member, 1 => static member
   *  3rd index : 0 => normal, 1 => abstract member, 2 => final member
   */
  read_member_flags: function (asInterface) {
    const result = [-1, -1, -1];
    if (this.is("T_MEMBER_FLAGS")) {
      let idx = 0,
        val = 0;
      do {
        switch (this.token) {
          case this.tok.T_PUBLIC:
            idx = 0;
            val = 0;
            break;
          case this.tok.T_PROTECTED:
            idx = 0;
            val = 1;
            break;
          case this.tok.T_PRIVATE:
            idx = 0;
            val = 2;
            break;
          case this.tok.T_STATIC:
            idx = 1;
            val = 1;
            break;
          case this.tok.T_ABSTRACT:
            idx = 2;
            val = 1;
            break;
          case this.tok.T_FINAL:
            idx = 2;
            val = 2;
            break;
        }
        if (asInterface) {
          if (idx == 0 && val == 2) {
            // an interface can't be private
            this.expect([this.tok.T_PUBLIC, this.tok.T_PROTECTED]);
            val = -1;
          } else if (idx == 2 && val == 1) {
            // an interface cant be abstract
            this.error();
            val = -1;
          }
        }
        if (result[idx] !== -1) {
          // already defined flag
          this.error();
        } else if (val !== -1) {
          result[idx] = val;
        }
      } while (this.next().is("T_MEMBER_FLAGS"));
    }

    if (result[1] == -1) result[1] = 0;
    if (result[2] == -1) result[2] = 0;
    return result;
  },

  /**
   * optional_type:
   *	  /- empty -/	{ $$ = NULL; }
   *   |	type_expr	{ $$ = $1; }
   * ;
   *
   * type_expr:
   *		type		{ $$ = $1; }
   *	|	'?' type	{ $$ = $2; $$->attr |= ZEND_TYPE_NULLABLE; }
   *	|	union_type	{ $$ = $1; }
   * ;
   *
   * type:
   * 		T_ARRAY		{ $$ = zend_ast_create_ex(ZEND_AST_TYPE, IS_ARRAY); }
   * 	|	T_CALLABLE	{ $$ = zend_ast_create_ex(ZEND_AST_TYPE, IS_CALLABLE); }
   * 	|	name		{ $$ = $1; }
   * ;
   *
   * union_type:
   * 		type '|' type       { $$ = zend_ast_create_list(2, ZEND_AST_TYPE_UNION, $1, $3); }
   * 	|	union_type '|' type { $$ = zend_ast_list_add($1, $3); }
   * ;
   */
  read_optional_type: function () {
    let nullable = false;
    if (this.token === "?") {
      nullable = true;
      this.next();
    }
    let type = this.read_type();
    if (nullable && !type) {
      this.raiseError(
        "Expecting a type definition combined with nullable operator"
      );
    }
    if (!nullable && !type) {
      return [false, null];
    }
    if (this.token === "|") {
      type = [type];
      do {
        this.next();
        const variant = this.read_type();
        if (!variant) {
          this.raiseError("Expecting a type definition");
          break;
        }
        type.push(variant);
      } while (this.token === "|");
    }
    return [nullable, type];
  },

  /**
   * reading an interface
   * ```ebnf
   * interface ::= T_INTERFACE T_STRING (T_EXTENDS (NAMESPACE_NAME ',')* NAMESPACE_NAME)? '{' INTERFACE_BODY '}'
   * ```
   */
  read_interface_declaration_statement: function () {
    const result = this.node("interface");
    if (this.token !== this.tok.T_INTERFACE) {
      this.error(this.tok.T_INTERFACE);
      this.next();
      return null;
    }
    this.next().expect(this.tok.T_STRING);
    let propName = this.node("identifier");
    const name = this.text();
    this.next();
    propName = propName(name);
    const propExtends = this.read_interface_extends_list();
    this.expect("{");
    const body = this.next().read_interface_body();
    return result(propName, propExtends, body);
  },
  /**
   * Reads an interface body
   * ```ebnf
   *   interface_body ::= (member_flags? (T_CONST | T_FUNCTION))*
   * ```
   */
  read_interface_body: function () {
    let result = [];

    while (this.token !== this.EOF && this.token !== "}") {
      if (this.token === this.tok.T_COMMENT) {
        result.push(this.read_comment());
        continue;
      }

      if (this.token === this.tok.T_DOC_COMMENT) {
        result.push(this.read_doc_comment());
        continue;
      }

      // read member flags
      const flags = this.read_member_flags(true);

      // check constant
      if (this.token == this.tok.T_CONST) {
        const constants = this.read_constant_list(flags);
        if (this.expect(";")) {
          this.next();
        }
        result = result.concat(constants);
      } else if (this.token === this.tok.T_FUNCTION) {
        // reads a function
        const method = this.read_function_declaration(2, flags);
        method.parseFlags(flags);
        result.push(method);
        if (this.expect(";")) {
          this.next();
        }
      } else {
        // raise an error
        this.error([this.tok.T_CONST, this.tok.T_FUNCTION]);
        this.next();
      }
    }
    if (this.expect("}")) {
      this.next();
    }
    return result;
  },
  /**
   * reading a trait
   * ```ebnf
   * trait ::= T_TRAIT T_STRING (T_EXTENDS (NAMESPACE_NAME ',')* NAMESPACE_NAME)? '{' FUNCTION* '}'
   * ```
   */
  read_trait_declaration_statement: function () {
    const result = this.node("trait");
    // graceful mode : ignore token & go next
    if (this.token !== this.tok.T_TRAIT) {
      this.error(this.tok.T_TRAIT);
      this.next();
      return null;
    }
    this.next().expect(this.tok.T_STRING);
    let propName = this.node("identifier");
    const name = this.text();
    this.next();
    propName = propName(name);
    this.expect("{");
    const body = this.next().read_class_body();
    return result(propName, body);
  },
  /**
   * reading a use statement
   * ```ebnf
   * trait_use_statement ::= namespace_name (',' namespace_name)* ('{' trait_use_alias '}')?
   * ```
   */
  read_trait_use_statement: function () {
    // defines use statements
    const node = this.node("traituse");
    this.expect(this.tok.T_USE) && this.next();
    const traits = [this.read_namespace_name()];
    let adaptations = null;
    while (this.token === ",") {
      traits.push(this.next().read_namespace_name());
    }
    if (this.token === "{") {
      adaptations = [];
      // defines alias statements
      while (this.next().token !== this.EOF) {
        if (this.token === "}") break;
        adaptations.push(this.read_trait_use_alias());
        this.expect(";");
      }
      if (this.expect("}")) {
        this.next();
      }
    } else {
      if (this.expect(";")) {
        this.next();
      }
    }
    return node(traits, adaptations);
  },
  /**
   * Reading trait alias
   * ```ebnf
   * trait_use_alias ::= namespace_name ( T_DOUBLE_COLON T_STRING )? (T_INSTEADOF namespace_name) | (T_AS member_flags? T_STRING)
   * ```
   * name list : https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L303
   * trait adaptation : https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L742
   */
  read_trait_use_alias: function () {
    const node = this.node();
    let trait = null;
    let method;

    if (this.is("IDENTIFIER")) {
      method = this.node("identifier");
      const methodName = this.text();
      this.next();
      method = method(methodName);
    } else {
      method = this.read_namespace_name();

      if (this.token === this.tok.T_DOUBLE_COLON) {
        this.next();
        if (
          this.token === this.tok.T_STRING ||
          (this.version >= 700 && this.is("IDENTIFIER"))
        ) {
          trait = method;
          method = this.node("identifier");
          const methodName = this.text();
          this.next();
          method = method(methodName);
        } else {
          this.expect(this.tok.T_STRING);
        }
      } else {
        // convert identifier as string
        method = method.name;
      }
    }

    // handle trait precedence
    if (this.token === this.tok.T_INSTEADOF) {
      return node(
        "traitprecedence",
        trait,
        method,
        this.next().read_name_list()
      );
    } else if (this.token === this.tok.T_AS) {
      // handle trait alias
      let flags = null;
      let alias = null;
      if (this.next().is("T_MEMBER_FLAGS")) {
        flags = this.read_member_flags();
      }

      if (
        this.token === this.tok.T_STRING ||
        (this.version >= 700 && this.is("IDENTIFIER"))
      ) {
        alias = this.node("identifier");
        const name = this.text();
        this.next();
        alias = alias(name);
      } else if (flags === false) {
        // no visibility flags and no name => too bad
        this.expect(this.tok.T_STRING);
      }

      return node("traitalias", trait, method, alias, flags);
    }

    // handle errors
    this.expect([this.tok.T_AS, this.tok.T_INSTEADOF]);
    return node("traitalias", trait, method, null, null);
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/comment.js":
/*!*******************************************************!*\
  !*** ./node_modules/php-parser/src/parser/comment.js ***!
  \*******************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   *  Comments with // or # or / * ... * /
   */
  read_comment: function () {
    const text = this.text();
    let result = this.ast.prepare(
      text.substring(0, 2) === "/*" ? "commentblock" : "commentline",
      null,
      this
    );
    const offset = this.lexer.yylloc.first_offset;
    // handle location on comment
    const prev = this.prev;
    this.prev = [
      this.lexer.yylloc.last_line,
      this.lexer.yylloc.last_column,
      this.lexer.offset,
    ];
    this.lex();
    result = result(text);
    result.offset = offset;
    this.prev = prev;
    return result;
  },
  /**
   * Comments with / ** ... * /
   */
  read_doc_comment: function () {
    let result = this.ast.prepare("commentblock", null, this);
    const offset = this.lexer.yylloc.first_offset;
    const text = this.text();
    const prev = this.prev;
    this.prev = [
      this.lexer.yylloc.last_line,
      this.lexer.yylloc.last_column,
      this.lexer.offset,
    ];
    this.lex();
    result = result(text);
    result.offset = offset;
    this.prev = prev;
    return result;
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/expr.js":
/*!****************************************************!*\
  !*** ./node_modules/php-parser/src/parser/expr.js ***!
  \****************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  read_expr: function (expr) {
    const result = this.node();
    if (this.token === "@") {
      if (!expr) {
        expr = this.next().read_expr();
      }
      return result("silent", expr);
    }
    if (!expr) {
      expr = this.read_expr_item();
    }
    // binary operations
    if (this.token === "|")
      return result("bin", "|", expr, this.next().read_expr());
    if (this.token === "&")
      return result("bin", "&", expr, this.next().read_expr());
    if (this.token === "^")
      return result("bin", "^", expr, this.next().read_expr());
    if (this.token === ".")
      return result("bin", ".", expr, this.next().read_expr());
    if (this.token === "+")
      return result("bin", "+", expr, this.next().read_expr());
    if (this.token === "-")
      return result("bin", "-", expr, this.next().read_expr());
    if (this.token === "*")
      return result("bin", "*", expr, this.next().read_expr());
    if (this.token === "/")
      return result("bin", "/", expr, this.next().read_expr());
    if (this.token === "%")
      return result("bin", "%", expr, this.next().read_expr());
    if (this.token === this.tok.T_POW)
      return result("bin", "**", expr, this.next().read_expr());
    if (this.token === this.tok.T_SL)
      return result("bin", "<<", expr, this.next().read_expr());
    if (this.token === this.tok.T_SR)
      return result("bin", ">>", expr, this.next().read_expr());
    // more binary operations (formerly bool)
    if (this.token === this.tok.T_BOOLEAN_OR)
      return result("bin", "||", expr, this.next().read_expr());
    if (this.token === this.tok.T_LOGICAL_OR)
      return result("bin", "or", expr, this.next().read_expr());
    if (this.token === this.tok.T_BOOLEAN_AND)
      return result("bin", "&&", expr, this.next().read_expr());
    if (this.token === this.tok.T_LOGICAL_AND)
      return result("bin", "and", expr, this.next().read_expr());
    if (this.token === this.tok.T_LOGICAL_XOR)
      return result("bin", "xor", expr, this.next().read_expr());
    if (this.token === this.tok.T_IS_IDENTICAL)
      return result("bin", "===", expr, this.next().read_expr());
    if (this.token === this.tok.T_IS_NOT_IDENTICAL)
      return result("bin", "!==", expr, this.next().read_expr());
    if (this.token === this.tok.T_IS_EQUAL)
      return result("bin", "==", expr, this.next().read_expr());
    if (this.token === this.tok.T_IS_NOT_EQUAL)
      return result("bin", "!=", expr, this.next().read_expr());
    if (this.token === "<")
      return result("bin", "<", expr, this.next().read_expr());
    if (this.token === ">")
      return result("bin", ">", expr, this.next().read_expr());
    if (this.token === this.tok.T_IS_SMALLER_OR_EQUAL)
      return result("bin", "<=", expr, this.next().read_expr());
    if (this.token === this.tok.T_IS_GREATER_OR_EQUAL)
      return result("bin", ">=", expr, this.next().read_expr());
    if (this.token === this.tok.T_SPACESHIP)
      return result("bin", "<=>", expr, this.next().read_expr());
    if (this.token === this.tok.T_INSTANCEOF) {
      expr = result(
        "bin",
        "instanceof",
        expr,
        this.next().read_class_name_reference()
      );
      if (
        this.token !== ";" &&
        this.token !== this.tok.T_INLINE_HTML &&
        this.token !== this.EOF
      ) {
        expr = this.read_expr(expr);
      }
    }

    // extra operations :
    // $username = $_GET['user'] ?? 'nobody';
    if (this.token === this.tok.T_COALESCE)
      return result("bin", "??", expr, this.next().read_expr());

    // extra operations :
    // $username = $_GET['user'] ? true : false;
    if (this.token === "?") {
      let trueArg = null;
      if (this.next().token !== ":") {
        trueArg = this.read_expr();
      }
      this.expect(":") && this.next();
      return result("retif", expr, trueArg, this.read_expr());
    } else {
      // see #193
      result.destroy(expr);
    }

    return expr;
  },

  /**
   * Reads a cast expression
   */
  read_expr_cast: function (type) {
    return this.node("cast")(type, this.text(), this.next().read_expr());
  },

  /**
   * Read a isset variable
   */
  read_isset_variable: function () {
    return this.read_expr();
  },

  /**
   * Reads isset variables
   */
  read_isset_variables: function () {
    return this.read_function_list(this.read_isset_variable, ",");
  },

  /*
   * Reads internal PHP functions
   */
  read_internal_functions_in_yacc: function () {
    let result = null;
    switch (this.token) {
      case this.tok.T_ISSET:
        {
          result = this.node("isset");
          if (this.next().expect("(")) {
            this.next();
          }
          const variables = this.read_isset_variables();
          if (this.expect(")")) {
            this.next();
          }
          result = result(variables);
        }
        break;
      case this.tok.T_EMPTY:
        {
          result = this.node("empty");
          if (this.next().expect("(")) {
            this.next();
          }
          const expression = this.read_expr();
          if (this.expect(")")) {
            this.next();
          }
          result = result(expression);
        }
        break;
      case this.tok.T_INCLUDE:
        result = this.node("include")(false, false, this.next().read_expr());
        break;
      case this.tok.T_INCLUDE_ONCE:
        result = this.node("include")(true, false, this.next().read_expr());
        break;
      case this.tok.T_EVAL:
        {
          result = this.node("eval");
          if (this.next().expect("(")) {
            this.next();
          }
          const expr = this.read_expr();
          if (this.expect(")")) {
            this.next();
          }
          result = result(expr);
        }
        break;
      case this.tok.T_REQUIRE:
        result = this.node("include")(false, true, this.next().read_expr());
        break;
      case this.tok.T_REQUIRE_ONCE:
        result = this.node("include")(true, true, this.next().read_expr());
        break;
    }

    return result;
  },

  /**
   * Reads optional expression
   */
  read_optional_expr: function (stopToken) {
    if (this.token !== stopToken) {
      return this.read_expr();
    }

    return null;
  },

  /**
   * Reads exit expression
   */
  read_exit_expr: function () {
    let expression = null;

    if (this.token === "(") {
      this.next();
      expression = this.read_optional_expr(")");
      this.expect(")") && this.next();
    }

    return expression;
  },

  /**
   * ```ebnf
   * Reads an expression
   *  expr ::= @todo
   * ```
   */
  read_expr_item: function () {
    let result, expr;
    if (this.token === "+")
      return this.node("unary")("+", this.next().read_expr());
    if (this.token === "-")
      return this.node("unary")("-", this.next().read_expr());
    if (this.token === "!")
      return this.node("unary")("!", this.next().read_expr());
    if (this.token === "~")
      return this.node("unary")("~", this.next().read_expr());

    if (this.token === "(") {
      expr = this.next().read_expr();
      expr.parenthesizedExpression = true;
      this.expect(")") && this.next();
      return this.handleDereferencable(expr);
    }

    if (this.token === "`") {
      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1048
      return this.read_encapsed_string("`");
    }

    if (this.token === this.tok.T_LIST) {
      let assign = null;
      const isInner = this.innerList;
      result = this.node("list");
      if (!isInner) {
        assign = this.node("assign");
      }
      if (this.next().expect("(")) {
        this.next();
      }

      if (!this.innerList) this.innerList = true;

      // reads inner items
      const assignList = this.read_array_pair_list(false);
      if (this.expect(")")) {
        this.next();
      }

      // check if contains at least one assignment statement
      let hasItem = false;
      for (let i = 0; i < assignList.length; i++) {
        if (assignList[i] !== null && assignList[i].kind !== "noop") {
          hasItem = true;
          break;
        }
      }
      if (!hasItem) {
        this.raiseError(
          "Fatal Error :  Cannot use empty list on line " +
            this.lexer.yylloc.first_line
        );
      }

      // handles the node resolution
      if (!isInner) {
        this.innerList = false;
        if (this.expect("=")) {
          return assign(
            result(assignList, false),
            this.next().read_expr(),
            "="
          );
        } else {
          // error fallback : list($a, $b);
          return result(assignList, false);
        }
      } else {
        return result(assignList, false);
      }
    }

    if (this.token === this.tok.T_CLONE)
      return this.node("clone")(this.next().read_expr());

    switch (this.token) {
      case this.tok.T_INC:
        return this.node("pre")("+", this.next().read_variable(false, false));

      case this.tok.T_DEC:
        return this.node("pre")("-", this.next().read_variable(false, false));

      case this.tok.T_NEW:
        return this.read_new_expr();

      case this.tok.T_ISSET:
      case this.tok.T_EMPTY:
      case this.tok.T_INCLUDE:
      case this.tok.T_INCLUDE_ONCE:
      case this.tok.T_EVAL:
      case this.tok.T_REQUIRE:
      case this.tok.T_REQUIRE_ONCE:
        return this.read_internal_functions_in_yacc();
      case this.tok.T_INT_CAST:
        return this.read_expr_cast("int");

      case this.tok.T_DOUBLE_CAST:
        return this.read_expr_cast("float");

      case this.tok.T_STRING_CAST:
        return this.read_expr_cast(
          this.text().indexOf("binary") !== -1 ? "binary" : "string"
        );

      case this.tok.T_ARRAY_CAST:
        return this.read_expr_cast("array");

      case this.tok.T_OBJECT_CAST:
        return this.read_expr_cast("object");

      case this.tok.T_BOOL_CAST:
        return this.read_expr_cast("bool");

      case this.tok.T_UNSET_CAST:
        return this.read_expr_cast("unset");

      case this.tok.T_EXIT: {
        const useDie = this.lexer.yytext.toLowerCase() === "die";
        result = this.node("exit");
        this.next();
        const expression = this.read_exit_expr();
        return result(expression, useDie);
      }

      case this.tok.T_PRINT:
        return this.node("print")(this.next().read_expr());

      // T_YIELD (expr (T_DOUBLE_ARROW expr)?)?
      case this.tok.T_YIELD: {
        let value = null;
        let key = null;
        result = this.node("yield");
        if (this.next().is("EXPR")) {
          // reads the yield return value
          value = this.read_expr();
          if (this.token === this.tok.T_DOUBLE_ARROW) {
            // reads the yield returned key
            key = value;
            value = this.next().read_expr();
          }
        }
        return result(value, key);
      }

      // T_YIELD_FROM expr
      case this.tok.T_YIELD_FROM:
        result = this.node("yieldfrom");
        expr = this.next().read_expr();
        return result(expr);

      case this.tok.T_FN:
      case this.tok.T_FUNCTION:
        return this.read_inline_function();

      case this.tok.T_STATIC: {
        const backup = [this.token, this.lexer.getState()];
        this.next();
        if (
          this.token === this.tok.T_FUNCTION ||
          (this.version >= 704 && this.token === this.tok.T_FN)
        ) {
          // handles static function
          return this.read_inline_function([0, 1, 0]);
        } else {
          // rollback
          this.lexer.tokens.push(backup);
          this.next();
        }
      }
    }

    // SCALAR | VARIABLE
    if (this.is("VARIABLE")) {
      result = this.node();
      expr = this.read_variable(false, false);

      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L877
      // should accept only a variable
      const isConst =
        expr.kind === "identifier" ||
        (expr.kind === "staticlookup" && expr.offset.kind === "identifier");

      // VARIABLES SPECIFIC OPERATIONS
      switch (this.token) {
        case "=": {
          if (isConst) this.error("VARIABLE");
          if (this.next().token == "&") {
            return this.read_assignref(result, expr);
          }
          return result("assign", expr, this.read_expr(), "=");
        }

        // operations :
        case this.tok.T_PLUS_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "+=");

        case this.tok.T_MINUS_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "-=");

        case this.tok.T_MUL_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "*=");

        case this.tok.T_POW_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "**=");

        case this.tok.T_DIV_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "/=");

        case this.tok.T_CONCAT_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), ".=");

        case this.tok.T_MOD_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "%=");

        case this.tok.T_AND_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "&=");

        case this.tok.T_OR_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "|=");

        case this.tok.T_XOR_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "^=");

        case this.tok.T_SL_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "<<=");

        case this.tok.T_SR_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), ">>=");

        case this.tok.T_COALESCE_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "??=");

        case this.tok.T_INC:
          if (isConst) this.error("VARIABLE");
          this.next();
          return result("post", "+", expr);
        case this.tok.T_DEC:
          if (isConst) this.error("VARIABLE");
          this.next();
          return result("post", "-", expr);
        default:
          // see #193
          result.destroy(expr);
      }
    } else if (this.is("SCALAR")) {
      result = this.node();
      expr = this.read_scalar();
      if (expr.kind === "array" && expr.shortForm && this.token === "=") {
        // list assign
        const list = this.convertToList(expr);
        if (expr.loc) list.loc = expr.loc;
        const right = this.next().read_expr();
        return result("assign", list, right, "=");
      } else {
        // see #189 - swap docs on nodes
        result.destroy(expr);
      }
      // classic array
      return this.handleDereferencable(expr);
    } else {
      this.error("EXPR");
      this.next();
    }

    // returns variable | scalar
    return expr;
  },

  /**
   * Recursively convert nested array to nested list.
   */
  convertToList: function (array) {
    const convertedItems = array.items.map((entry) => {
      if (
        entry.value &&
        entry.value.kind === "array" &&
        entry.value.shortForm
      ) {
        entry.value = this.convertToList(entry.value);
      }
      return entry;
    });
    const node = this.node("list")(convertedItems, true);
    if (array.loc) node.loc = array.loc;
    if (array.leadingComments) node.leadingComments = array.leadingComments;
    if (array.trailingComments) node.trailingComments = array.trailingComments;
    return node;
  },

  /**
   * Reads assignment
   * @param {*} left
   */
  read_assignref: function (result, left) {
    this.next();
    let right;
    if (this.token === this.tok.T_NEW) {
      if (this.version >= 700) {
        this.error();
      }
      right = this.read_new_expr();
    } else {
      right = this.read_variable(false, false);
    }

    return result("assignref", left, right);
  },

  /**
   *
   * inline_function:
   * 		function returns_ref backup_doc_comment '(' parameter_list ')' lexical_vars return_type
   * 		backup_fn_flags '{' inner_statement_list '}' backup_fn_flags
   * 			{ $$ = zend_ast_create_decl(ZEND_AST_CLOSURE, $2 | $13, $1, $3,
   * 				  zend_string_init("{closure}", sizeof("{closure}") - 1, 0),
   * 				  $5, $7, $11, $8); CG(extra_fn_flags) = $9; }
   * 	|	fn returns_ref '(' parameter_list ')' return_type backup_doc_comment T_DOUBLE_ARROW backup_fn_flags backup_lex_pos expr backup_fn_flags
   * 			{ $$ = zend_ast_create_decl(ZEND_AST_ARROW_FUNC, $2 | $12, $1, $7,
   * 				  zend_string_init("{closure}", sizeof("{closure}") - 1, 0), $4, NULL,
   * 				  zend_ast_create(ZEND_AST_RETURN, $11), $6);
   * 				  ((zend_ast_decl *) $$)->lex_pos = $10;
   * 				  CG(extra_fn_flags) = $9; }   *
   */
  read_inline_function: function (flags) {
    if (this.token === this.tok.T_FUNCTION) {
      return this.read_function(true, flags);
    }
    // introduced in PHP 7.4
    if (!this.version >= 704) {
      this.raiseError("Arrow Functions are not allowed");
    }
    // as an arrowfunc
    const node = this.node("arrowfunc");
    // eat T_FN
    if (this.expect(this.tok.T_FN)) this.next();
    // check the &
    const isRef = this.is_reference();
    // ...
    if (this.expect("(")) this.next();
    const params = this.read_parameter_list();
    if (this.expect(")")) this.next();
    let nullable = false;
    let returnType = null;
    if (this.token === ":") {
      if (this.next().token === "?") {
        nullable = true;
        this.next();
      }
      returnType = this.read_type();
    }
    if (this.expect(this.tok.T_DOUBLE_ARROW)) this.next();
    const body = this.read_expr();
    return node(
      params,
      isRef,
      body,
      returnType,
      nullable,
      flags ? true : false
    );
  },

  /**
   * ```ebnf
   *    new_expr ::= T_NEW (namespace_name function_argument_list) | (T_CLASS ... class declaration)
   * ```
   * https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L850
   */
  read_new_expr: function () {
    const result = this.node("new");
    this.expect(this.tok.T_NEW) && this.next();
    let args = [];
    if (this.token === this.tok.T_CLASS) {
      const what = this.node("class");
      // Annonymous class declaration
      if (this.next().token === "(") {
        args = this.read_argument_list();
      }
      const propExtends = this.read_extends_from();
      const propImplements = this.read_implements_list();
      let body = null;
      if (this.expect("{")) {
        body = this.next().read_class_body();
      }
      return result(
        what(null, propExtends, propImplements, body, [0, 0, 0]),
        args
      );
    }
    // Already existing class
    const name = this.read_new_class_name();
    if (this.token === "(") {
      args = this.read_argument_list();
    }
    return result(name, args);
  },
  /**
   * Reads a class name
   * ```ebnf
   * read_new_class_name ::= namespace_name | variable
   * ```
   */
  read_new_class_name: function () {
    if (
      this.token === this.tok.T_NS_SEPARATOR ||
      this.token === this.tok.T_STRING ||
      this.token === this.tok.T_NAMESPACE
    ) {
      let result = this.read_namespace_name(true);
      if (this.token === this.tok.T_DOUBLE_COLON) {
        result = this.read_static_getter(result);
      }
      return result;
    } else if (this.is("VARIABLE")) {
      return this.read_variable(true, false);
    } else {
      this.expect([this.tok.T_STRING, "VARIABLE"]);
    }
  },
  handleDereferencable: function (expr) {
    while (this.token !== this.EOF) {
      if (
        this.token === this.tok.T_OBJECT_OPERATOR ||
        this.token === this.tok.T_DOUBLE_COLON
      ) {
        expr = this.recursive_variable_chain_scan(expr, false, false, true);
      } else if (this.token === this.tok.T_CURLY_OPEN || this.token === "[") {
        expr = this.read_dereferencable(expr);
      } else if (this.token === "(") {
        // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1118
        expr = this.node("call")(expr, this.read_argument_list());
      } else {
        return expr;
      }
    }
    return expr;
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/function.js":
/*!********************************************************!*\
  !*** ./node_modules/php-parser/src/parser/function.js ***!
  \********************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * checks if current token is a reference keyword
   */
  is_reference: function () {
    if (this.token == "&") {
      this.next();
      return true;
    }
    return false;
  },
  /**
   * checks if current token is a variadic keyword
   */
  is_variadic: function () {
    if (this.token === this.tok.T_ELLIPSIS) {
      this.next();
      return true;
    }
    return false;
  },
  /**
   * reading a function
   * ```ebnf
   * function ::= function_declaration code_block
   * ```
   */
  read_function: function (closure, flag) {
    const result = this.read_function_declaration(
      closure ? 1 : flag ? 2 : 0,
      flag && flag[1] === 1
    );
    if (flag && flag[2] == 1) {
      // abstract function :
      result.parseFlags(flag);
      if (this.expect(";")) {
        this.next();
      }
    } else {
      if (this.expect("{")) {
        result.body = this.read_code_block(false);
        if (result.loc && result.body.loc) {
          result.loc.end = result.body.loc.end;
        }
      }
      if (!closure && flag) {
        result.parseFlags(flag);
      }
    }
    return result;
  },
  /**
   * reads a function declaration (without his body)
   * ```ebnf
   * function_declaration ::= T_FUNCTION '&'?  T_STRING '(' parameter_list ')'
   * ```
   */
  read_function_declaration: function (type, isStatic) {
    let nodeName = "function";
    if (type === 1) {
      nodeName = "closure";
    } else if (type === 2) {
      nodeName = "method";
    }
    const result = this.node(nodeName);

    if (this.expect(this.tok.T_FUNCTION)) {
      this.next();
    }
    const isRef = this.is_reference();
    let name = false,
      use = [],
      returnType = null,
      nullable = false;
    if (type !== 1) {
      const nameNode = this.node("identifier");
      if (type === 2) {
        if (this.version >= 700) {
          if (this.token === this.tok.T_STRING || this.is("IDENTIFIER")) {
            name = this.text();
            this.next();
          } else if (this.version < 704) {
            this.error("IDENTIFIER");
          }
        } else if (this.token === this.tok.T_STRING) {
          name = this.text();
          this.next();
        } else {
          this.error("IDENTIFIER");
        }
      } else {
        if (this.version >= 700) {
          if (this.token === this.tok.T_STRING) {
            name = this.text();
            this.next();
          } else if (this.version >= 704) {
            if (!this.expect("(")) {
              this.next();
            }
          } else {
            this.error(this.tok.T_STRING);
            this.next();
          }
        } else {
          if (this.expect(this.tok.T_STRING)) {
            name = this.text();
          }
          this.next();
        }
      }
      name = nameNode(name);
    }
    if (this.expect("(")) this.next();
    const params = this.read_parameter_list();
    if (this.expect(")")) this.next();
    if (type === 1) {
      use = this.read_lexical_vars();
    }
    if (this.token === ":") {
      if (this.next().token === "?") {
        nullable = true;
        this.next();
      }
      returnType = this.read_type();
    }
    if (type === 1) {
      // closure
      return result(params, isRef, use, returnType, nullable, isStatic);
    }
    return result(name, params, isRef, returnType, nullable);
  },

  read_lexical_vars: function () {
    let result = [];

    if (this.token === this.tok.T_USE) {
      this.next();
      this.expect("(") && this.next();
      result = this.read_lexical_var_list();
      this.expect(")") && this.next();
    }

    return result;
  },

  read_lexical_var_list: function () {
    return this.read_list(this.read_lexical_var, ",");
  },

  /**
   * ```ebnf
   * lexical_var ::= '&'? T_VARIABLE
   * ```
   */
  read_lexical_var: function () {
    if (this.token === "&") {
      return this.read_byref(this.read_lexical_var.bind(this));
    }
    const result = this.node("variable");
    this.expect(this.tok.T_VARIABLE);
    const name = this.text().substring(1);
    this.next();
    return result(name, false);
  },
  /**
   * reads a list of parameters
   * ```ebnf
   *  parameter_list ::= (parameter ',')* parameter?
   * ```
   */
  read_parameter_list: function () {
    const result = [];
    if (this.token != ")") {
      while (this.token != this.EOF) {
        result.push(this.read_parameter());
        if (this.token == ",") {
          this.next();
        } else if (this.token == ")") {
          break;
        } else {
          this.error([",", ")"]);
          break;
        }
      }
    }
    return result;
  },
  /**
   * ```ebnf
   *  parameter ::= type? '&'? T_ELLIPSIS? T_VARIABLE ('=' expr)?
   * ```
   * @see https://github.com/php/php-src/blob/493524454d66adde84e00d249d607ecd540de99f/Zend/zend_language_parser.y#L640
   */
  read_parameter: function () {
    const node = this.node("parameter");
    let parameterName = null;
    let value = null;
    let type = null;
    let nullable = false;
    if (this.token === "?") {
      this.next();
      nullable = true;
    }
    type = this.read_type();
    if (nullable && !type) {
      this.raiseError(
        "Expecting a type definition combined with nullable operator"
      );
    }
    const isRef = this.is_reference();
    const isVariadic = this.is_variadic();
    if (this.expect(this.tok.T_VARIABLE)) {
      parameterName = this.node("identifier");
      const name = this.text().substring(1);
      this.next();
      parameterName = parameterName(name);
    }
    if (this.token == "=") {
      value = this.next().read_expr();
    }
    return node(parameterName, type, value, isRef, isVariadic, nullable);
  },
  /**
   * Reads a list of arguments
   * ```ebnf
   *  function_argument_list ::= '(' (argument_list (',' argument_list)*)? ')'
   * ```
   */
  read_argument_list: function () {
    let result = [];
    this.expect("(") && this.next();
    if (this.token !== ")") {
      result = this.read_non_empty_argument_list();
    }
    this.expect(")") && this.next();
    return result;
  },
  /**
   * Reads non empty argument list
   */
  read_non_empty_argument_list: function () {
    let wasVariadic = false;

    return this.read_function_list(
      function () {
        const argument = this.read_argument();
        if (argument) {
          if (wasVariadic) {
            this.raiseError("Unexpected argument after a variadic argument");
          }
          if (argument.kind === "variadic") {
            wasVariadic = true;
          }
        }
        return argument;
      }.bind(this),
      ","
    );
  },
  /**
   * ```ebnf
   *    argument_list ::= T_ELLIPSIS? expr
   * ```
   */
  read_argument: function () {
    if (this.token === this.tok.T_ELLIPSIS) {
      return this.node("variadic")(this.next().read_expr());
    }
    return this.read_expr();
  },
  /**
   * read type hinting
   * ```ebnf
   *  type ::= T_ARRAY | T_CALLABLE | namespace_name
   * ```
   */
  read_type: function () {
    const result = this.node();
    if (this.token === this.tok.T_ARRAY || this.token === this.tok.T_CALLABLE) {
      const type = this.text();
      this.next();
      return result("typereference", type.toLowerCase(), type);
    } else if (this.token === this.tok.T_STRING) {
      const type = this.text();
      const backup = [this.token, this.lexer.getState()];
      this.next();
      if (
        this.token !== this.tok.T_NS_SEPARATOR &&
        this.ast.typereference.types.indexOf(type.toLowerCase()) > -1
      ) {
        return result("typereference", type.toLowerCase(), type);
      } else {
        // rollback a classic namespace
        this.lexer.tokens.push(backup);
        this.next();
        // fix : destroy not consumed node (release comments)
        result.destroy();
        return this.read_namespace_name();
      }
    } else if (
      this.token === this.tok.T_NAMESPACE ||
      this.token === this.tok.T_NS_SEPARATOR
    ) {
      // fix : destroy not consumed node (release comments)
      result.destroy();
      return this.read_namespace_name();
    }
    // fix : destroy not consumed node (release comments)
    result.destroy();
    return null;
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/if.js":
/*!**************************************************!*\
  !*** ./node_modules/php-parser/src/parser/if.js ***!
  \**************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads an IF statement
   *
   * ```ebnf
   *  if ::= T_IF '(' expr ')' ':' ...
   * ```
   */
  read_if: function () {
    const result = this.node("if");
    const test = this.next().read_if_expr();
    let body = null;
    let alternate = null;
    let shortForm = false;

    if (this.token === ":") {
      shortForm = true;
      this.next();
      body = this.node("block");
      const items = [];
      while (this.token !== this.EOF && this.token !== this.tok.T_ENDIF) {
        if (this.token === this.tok.T_ELSEIF) {
          alternate = this.read_elseif_short();
          break;
        } else if (this.token === this.tok.T_ELSE) {
          alternate = this.read_else_short();
          break;
        }
        items.push(this.read_inner_statement());
      }
      body = body(null, items);
      this.expect(this.tok.T_ENDIF) && this.next();
      this.expectEndOfStatement();
    } else {
      body = this.read_statement();
      if (this.token === this.tok.T_ELSEIF) {
        alternate = this.read_if();
      } else if (this.token === this.tok.T_ELSE) {
        alternate = this.next().read_statement();
      }
    }
    return result(test, body, alternate, shortForm);
  },
  /**
   * reads an if expression : '(' expr ')'
   */
  read_if_expr: function () {
    this.expect("(") && this.next();
    const result = this.read_expr();
    this.expect(")") && this.next();
    return result;
  },
  /**
   * reads an elseif (expr): statements
   */
  read_elseif_short: function () {
    let alternate = null;
    const result = this.node("if");
    const test = this.next().read_if_expr();
    if (this.expect(":")) this.next();
    const body = this.node("block");
    const items = [];
    while (this.token != this.EOF && this.token !== this.tok.T_ENDIF) {
      if (this.token === this.tok.T_ELSEIF) {
        alternate = this.read_elseif_short();
        break;
      } else if (this.token === this.tok.T_ELSE) {
        alternate = this.read_else_short();
        break;
      }
      items.push(this.read_inner_statement());
    }
    return result(test, body(null, items), alternate, true);
  },
  /**
   *
   */
  read_else_short: function () {
    if (this.next().expect(":")) this.next();
    const body = this.node("block");
    const items = [];
    while (this.token != this.EOF && this.token !== this.tok.T_ENDIF) {
      items.push(this.read_inner_statement());
    }
    return body(null, items);
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/loops.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/parser/loops.js ***!
  \*****************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads a while statement
   * ```ebnf
   * while ::= T_WHILE (statement | ':' inner_statement_list T_ENDWHILE ';')
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L587
   * @return {While}
   */
  read_while: function () {
    const result = this.node("while");
    this.expect(this.tok.T_WHILE) && this.next();
    let test = null;
    let body = null;
    let shortForm = false;
    if (this.expect("(")) this.next();
    test = this.read_expr();
    if (this.expect(")")) this.next();
    if (this.token === ":") {
      shortForm = true;
      body = this.read_short_form(this.tok.T_ENDWHILE);
    } else {
      body = this.read_statement();
    }
    return result(test, body, shortForm);
  },
  /**
   * Reads a do / while loop
   * ```ebnf
   * do ::= T_DO statement T_WHILE '(' expr ')' ';'
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L423
   * @return {Do}
   */
  read_do: function () {
    const result = this.node("do");
    this.expect(this.tok.T_DO) && this.next();
    let test = null;
    let body = null;
    body = this.read_statement();
    if (this.expect(this.tok.T_WHILE)) {
      if (this.next().expect("(")) this.next();
      test = this.read_expr();
      if (this.expect(")")) this.next();
      if (this.expect(";")) this.next();
    }
    return result(test, body);
  },
  /**
   * Read a for incremental loop
   * ```ebnf
   * for ::= T_FOR '(' for_exprs ';' for_exprs ';' for_exprs ')' for_statement
   * for_statement ::= statement | ':' inner_statement_list T_ENDFOR ';'
   * for_exprs ::= expr? (',' expr)*
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L425
   * @return {For}
   */
  read_for: function () {
    const result = this.node("for");
    this.expect(this.tok.T_FOR) && this.next();
    let init = [];
    let test = [];
    let increment = [];
    let body = null;
    let shortForm = false;
    if (this.expect("(")) this.next();
    if (this.token !== ";") {
      init = this.read_list(this.read_expr, ",");
      if (this.expect(";")) this.next();
    } else {
      this.next();
    }
    if (this.token !== ";") {
      test = this.read_list(this.read_expr, ",");
      if (this.expect(";")) this.next();
    } else {
      this.next();
    }
    if (this.token !== ")") {
      increment = this.read_list(this.read_expr, ",");
      if (this.expect(")")) this.next();
    } else {
      this.next();
    }
    if (this.token === ":") {
      shortForm = true;
      body = this.read_short_form(this.tok.T_ENDFOR);
    } else {
      body = this.read_statement();
    }
    return result(init, test, increment, body, shortForm);
  },
  /**
   * Reads a foreach loop
   * ```ebnf
   * foreach ::= '(' expr T_AS foreach_variable (T_DOUBLE_ARROW foreach_variable)? ')' statement
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L438
   * @return {Foreach}
   */
  read_foreach: function () {
    const result = this.node("foreach");
    this.expect(this.tok.T_FOREACH) && this.next();
    let source = null;
    let key = null;
    let value = null;
    let body = null;
    let shortForm = false;
    if (this.expect("(")) this.next();
    source = this.read_expr();
    if (this.expect(this.tok.T_AS)) {
      this.next();
      value = this.read_foreach_variable();
      if (this.token === this.tok.T_DOUBLE_ARROW) {
        key = value;
        value = this.next().read_foreach_variable();
      }
    }

    // grammatically correct but not supported by PHP
    if (key && key.kind === "list") {
      this.raiseError("Fatal Error : Cannot use list as key element");
    }

    if (this.expect(")")) this.next();

    if (this.token === ":") {
      shortForm = true;
      body = this.read_short_form(this.tok.T_ENDFOREACH);
    } else {
      body = this.read_statement();
    }
    return result(source, key, value, body, shortForm);
  },
  /**
   * Reads a foreach variable statement
   * ```ebnf
   * foreach_variable =
   *    variable |
   *    '&' variable |
   *    T_LIST '(' assignment_list ')' |
   *    '[' assignment_list ']'
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L544
   * @return {Expression}
   */
  read_foreach_variable: function () {
    if (this.token === this.tok.T_LIST || this.token === "[") {
      const isShort = this.token === "[";
      const result = this.node("list");
      this.next();
      if (!isShort && this.expect("(")) this.next();
      const assignList = this.read_array_pair_list(isShort);
      if (this.expect(isShort ? "]" : ")")) this.next();
      return result(assignList, isShort);
    } else {
      return this.read_variable(false, false);
    }
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/main.js":
/*!****************************************************!*\
  !*** ./node_modules/php-parser/src/parser/main.js ***!
  \****************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * ```ebnf
   * start ::= (namespace | top_statement)*
   * ```
   */
  read_start: function () {
    if (this.token == this.tok.T_NAMESPACE) {
      return this.read_namespace();
    } else {
      return this.read_top_statement();
    }
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/namespace.js":
/*!*********************************************************!*\
  !*** ./node_modules/php-parser/src/parser/namespace.js ***!
  \*********************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads a namespace declaration block
   * ```ebnf
   * namespace ::= T_NAMESPACE namespace_name? '{'
   *    top_statements
   * '}'
   * | T_NAMESPACE namespace_name ';' top_statements
   * ```
   * @see http://php.net/manual/en/language.namespaces.php
   * @return {Namespace}
   */
  read_namespace: function () {
    const result = this.node("namespace");
    let body;
    this.expect(this.tok.T_NAMESPACE) && this.next();
    let name;

    if (this.token == "{") {
      name = {
        name: [""],
      };
    } else {
      name = this.read_namespace_name();
    }
    this.currentNamespace = name;

    if (this.token == ";") {
      this.currentNamespace = name;
      body = this.next().read_top_statements();
      this.expect(this.EOF);
      return result(name.name, body, false);
    } else if (this.token == "{") {
      this.currentNamespace = name;
      body = this.next().read_top_statements();
      this.expect("}") && this.next();
      if (
        body.length === 0 &&
        this.extractDoc &&
        this._docs.length > this._docIndex
      ) {
        body.push(this.node("noop")());
      }
      return result(name.name, body, true);
    } else if (this.token === "(") {
      // @fixme after merging #478
      name.resolution = this.ast.reference.RELATIVE_NAME;
      name.name = name.name.substring(1);
      result.destroy();
      return this.node("call")(name, this.read_argument_list());
    } else {
      this.error(["{", ";"]);
      // graceful mode :
      this.currentNamespace = name;
      body = this.read_top_statements();
      this.expect(this.EOF);
      return result(name, body, false);
    }
  },
  /**
   * Reads a namespace name
   * ```ebnf
   *  namespace_name ::= T_NS_SEPARATOR? (T_STRING T_NS_SEPARATOR)* T_STRING
   * ```
   * @see http://php.net/manual/en/language.namespaces.rules.php
   * @return {Reference}
   */
  read_namespace_name: function (resolveReference) {
    const result = this.node();
    let relative = false;
    if (this.token === this.tok.T_NAMESPACE) {
      this.next().expect(this.tok.T_NS_SEPARATOR) && this.next();
      relative = true;
    }
    const names = this.read_list(
      this.tok.T_STRING,
      this.tok.T_NS_SEPARATOR,
      true
    );
    if (
      !relative &&
      names.length === 1 &&
      (resolveReference || this.token !== "(")
    ) {
      if (names[0].toLowerCase() === "parent") {
        return result("parentreference", names[0]);
      } else if (names[0].toLowerCase() === "self") {
        return result("selfreference", names[0]);
      }
    }
    return result("name", names, relative);
  },
  /**
   * Reads a use statement
   * ```ebnf
   * use_statement ::= T_USE
   *   use_type? use_declarations |
   *   use_type use_statement '{' use_declarations '}' |
   *   use_statement '{' use_declarations(=>typed) '}'
   * ';'
   * ```
   * @see http://php.net/manual/en/language.namespaces.importing.php
   * @return {UseGroup}
   */
  read_use_statement: function () {
    let result = this.node("usegroup");
    let items = [];
    let name = null;
    this.expect(this.tok.T_USE) && this.next();
    const type = this.read_use_type();
    items.push(this.read_use_declaration(false));
    if (this.token === ",") {
      items = items.concat(this.next().read_use_declarations(false));
    } else if (this.token === "{") {
      name = items[0].name;
      items = this.next().read_use_declarations(type === null);
      this.expect("}") && this.next();
    }
    result = result(name, type, items);
    this.expect(";") && this.next();
    return result;
  },
  /**
   *
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1045
   */
  read_class_name_reference: function () {
    // resolved as the same
    return this.read_variable(true, false);
  },
  /**
   * Reads a use declaration
   * ```ebnf
   * use_declaration ::= use_type? namespace_name use_alias
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L380
   * @return {UseItem}
   */
  read_use_declaration: function (typed) {
    const result = this.node("useitem");
    let type = null;
    if (typed) type = this.read_use_type();
    const name = this.read_namespace_name();
    const alias = this.read_use_alias();
    return result(name.name, alias, type);
  },
  /**
   * Reads a list of use declarations
   * ```ebnf
   * use_declarations ::= use_declaration (',' use_declaration)*
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L380
   * @return {UseItem[]}
   */
  read_use_declarations: function (typed) {
    const result = [this.read_use_declaration(typed)];
    while (this.token === ",") {
      this.next();
      if (typed) {
        if (
          this.token !== this.tok.T_FUNCTION &&
          this.token !== this.tok.T_CONST &&
          this.token !== this.tok.T_STRING
        ) {
          break;
        }
      } else if (
        this.token !== this.tok.T_STRING &&
        this.token !== this.tok.T_NS_SEPARATOR
      ) {
        break;
      }
      result.push(this.read_use_declaration(typed));
    }
    return result;
  },
  /**
   * Reads a use statement
   * ```ebnf
   * use_alias ::= (T_AS T_STRING)?
   * ```
   * @return {String|null}
   */
  read_use_alias: function () {
    let result = null;
    if (this.token === this.tok.T_AS) {
      if (this.next().expect(this.tok.T_STRING)) {
        const aliasName = this.node("identifier");
        const name = this.text();
        this.next();
        result = aliasName(name);
      }
    }
    return result;
  },
  /**
   * Reads the namespace type declaration
   * ```ebnf
   * use_type ::= (T_FUNCTION | T_CONST)?
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L335
   * @return {String|null} Possible values : function, const
   */
  read_use_type: function () {
    if (this.token === this.tok.T_FUNCTION) {
      this.next();
      return this.ast.useitem.TYPE_FUNCTION;
    } else if (this.token === this.tok.T_CONST) {
      this.next();
      return this.ast.useitem.TYPE_CONST;
    }
    return null;
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/scalar.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/parser/scalar.js ***!
  \******************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const specialChar = {
  "\\": "\\",
  $: "$",
  n: "\n",
  r: "\r",
  t: "\t",
  f: String.fromCharCode(12),
  v: String.fromCharCode(11),
  e: String.fromCharCode(27),
};

module.exports = {
  /**
   * Unescape special chars
   */
  resolve_special_chars: function (text, doubleQuote) {
    if (!doubleQuote) {
      // single quote fix
      return text.replace(/\\\\/g, "\\").replace(/\\'/g, "'");
    }
    return text
      .replace(/\\"/, '"')
      .replace(
        /\\([\\$nrtfve]|[xX][0-9a-fA-F]{1,2}|[0-7]{1,3}|u{([0-9a-fA-F]+)})/g,
        ($match, p1, p2) => {
          if (specialChar[p1]) {
            return specialChar[p1];
          } else if ("x" === p1[0] || "X" === p1[0]) {
            return String.fromCodePoint(parseInt(p1.substr(1), 16));
          } else if ("u" === p1[0]) {
            return String.fromCodePoint(parseInt(p2, 16));
          } else {
            return String.fromCodePoint(parseInt(p1, 8));
          }
        }
      );
  },

  /**
   * Remove all leading spaces each line for heredoc text if there is a indentation
   * @param {string} text
   * @param {number} indentation
   * @param {boolean} indentation_uses_spaces
   * @param {boolean} first_encaps_node if it is behind a variable, the first N spaces should not be removed
   */
  remove_heredoc_leading_whitespace_chars: function (
    text,
    indentation,
    indentation_uses_spaces,
    first_encaps_node
  ) {
    if (indentation === 0) {
      return text;
    }

    this.check_heredoc_indentation_level(
      text,
      indentation,
      indentation_uses_spaces,
      first_encaps_node
    );

    const matchedChar = indentation_uses_spaces ? " " : "\t";
    const removementRegExp = new RegExp(
      `\\n${matchedChar}{${indentation}}`,
      "g"
    );
    const removementFirstEncapsNodeRegExp = new RegExp(
      `^${matchedChar}{${indentation}}`
    );

    // Rough replace, need more check
    if (first_encaps_node) {
      // Remove text leading whitespace
      text = text.replace(removementFirstEncapsNodeRegExp, "");
    }

    // Remove leading whitespace after \n
    return text.replace(removementRegExp, "\n");
  },

  /**
   * Check indentation level of heredoc in text, if mismatch, raiseError
   * @param {string} text
   * @param {number} indentation
   * @param {boolean} indentation_uses_spaces
   * @param {boolean} first_encaps_node if it is behind a variable, the first N spaces should not be removed
   */
  check_heredoc_indentation_level: function (
    text,
    indentation,
    indentation_uses_spaces,
    first_encaps_node
  ) {
    const textSize = text.length;
    let offset = 0;
    let leadingWhitespaceCharCount = 0;
    /**
     * @var inCoutingState {boolean} reset to true after a new line
     */
    let inCoutingState = true;
    const chToCheck = indentation_uses_spaces ? " " : "\t";
    let inCheckState = false;
    if (!first_encaps_node) {
      // start from first \n
      offset = text.indexOf("\n");
      // if no \n, just return
      if (offset === -1) {
        return;
      }
      offset++;
    }
    while (offset < textSize) {
      if (inCoutingState) {
        if (text[offset] === chToCheck) {
          leadingWhitespaceCharCount++;
        } else {
          inCheckState = true;
        }
      } else {
        inCoutingState = false;
      }

      if (
        text[offset] !== "\n" &&
        inCheckState &&
        leadingWhitespaceCharCount < indentation
      ) {
        this.raiseError(
          `Invalid body indentation level (expecting an indentation at least ${indentation})`
        );
      } else {
        inCheckState = false;
      }

      if (text[offset] === "\n") {
        // Reset counting state
        inCoutingState = true;
        leadingWhitespaceCharCount = 0;
      }
      offset++;
    }
  },

  /**
   * Reads dereferencable scalar
   */
  read_dereferencable_scalar: function () {
    let result = null;

    switch (this.token) {
      case this.tok.T_CONSTANT_ENCAPSED_STRING:
        {
          let value = this.node("string");
          const text = this.text();
          let offset = 0;
          if (text[0] === "b" || text[0] === "B") {
            offset = 1;
          }
          const isDoubleQuote = text[offset] === '"';
          this.next();
          const textValue = this.resolve_special_chars(
            text.substring(offset + 1, text.length - 1),
            isDoubleQuote
          );
          value = value(
            isDoubleQuote,
            textValue,
            offset === 1, // unicode flag
            text
          );
          if (this.token === this.tok.T_DOUBLE_COLON) {
            // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1151
            result = this.read_static_getter(value);
          } else {
            // dirrect string
            result = value;
          }
        }
        break;
      case this.tok.T_ARRAY: // array parser
        result = this.read_array();
        break;
      case "[": // short array format
        result = this.read_array();
        break;
    }

    return result;
  },

  /**
   * ```ebnf
   *  scalar ::= T_MAGIC_CONST
   *       | T_LNUMBER | T_DNUMBER
   *       | T_START_HEREDOC T_ENCAPSED_AND_WHITESPACE? T_END_HEREDOC
   *       | '"' encaps_list '"'
   *       | T_START_HEREDOC encaps_list T_END_HEREDOC
   *       | namespace_name (T_DOUBLE_COLON T_STRING)?
   * ```
   */
  read_scalar: function () {
    if (this.is("T_MAGIC_CONST")) {
      return this.get_magic_constant();
    } else {
      let value, node;
      switch (this.token) {
        // NUMERIC
        case this.tok.T_LNUMBER: // long
        case this.tok.T_DNUMBER: {
          // double
          const result = this.node("number");
          value = this.text();
          this.next();
          return result(value, null);
        }
        case this.tok.T_START_HEREDOC:
          if (this.lexer.curCondition === "ST_NOWDOC") {
            const start = this.lexer.yylloc.first_offset;
            node = this.node("nowdoc");
            value = this.next().text();
            // strip the last line return char
            if (this.lexer.heredoc_label.indentation > 0) {
              value = value.substring(
                0,
                value.length - this.lexer.heredoc_label.indentation
              );
            }
            const lastCh = value[value.length - 1];
            if (lastCh === "\n") {
              if (value[value.length - 2] === "\r") {
                // windows style
                value = value.substring(0, value.length - 2);
              } else {
                // linux style
                value = value.substring(0, value.length - 1);
              }
            } else if (lastCh === "\r") {
              // mac style
              value = value.substring(0, value.length - 1);
            }
            this.expect(this.tok.T_ENCAPSED_AND_WHITESPACE) && this.next();
            this.expect(this.tok.T_END_HEREDOC) && this.next();
            const raw = this.lexer._input.substring(
              start,
              this.lexer.yylloc.first_offset
            );
            node = node(
              this.remove_heredoc_leading_whitespace_chars(
                value,
                this.lexer.heredoc_label.indentation,
                this.lexer.heredoc_label.indentation_uses_spaces,
                this.lexer.heredoc_label.first_encaps_node
              ),
              raw,
              this.lexer.heredoc_label.label
            );
            return node;
          } else {
            return this.read_encapsed_string(this.tok.T_END_HEREDOC);
          }

        case '"':
          return this.read_encapsed_string('"');

        case 'b"':
        case 'B"': {
          return this.read_encapsed_string('"', true);
        }

        // TEXTS
        case this.tok.T_CONSTANT_ENCAPSED_STRING:
        case this.tok.T_ARRAY: // array parser
        case "[": // short array format
          return this.read_dereferencable_scalar();
        default: {
          const err = this.error("SCALAR");
          // graceful mode : ignore token & return error node
          this.next();
          return err;
        }
      }
    }
  },
  /**
   * Handles the dereferencing
   */
  read_dereferencable: function (expr) {
    let result, offset;
    const node = this.node("offsetlookup");
    if (this.token === "[") {
      offset = this.next().read_expr();
      if (this.expect("]")) this.next();
      result = node(expr, offset);
    } else if (this.token === this.tok.T_DOLLAR_OPEN_CURLY_BRACES) {
      offset = this.read_encapsed_string_item(false);
      result = node(expr, offset);
    }
    return result;
  },
  /**
   * Reads and extracts an encapsed item
   * ```ebnf
   * encapsed_string_item ::= T_ENCAPSED_AND_WHITESPACE
   *  | T_DOLLAR_OPEN_CURLY_BRACES expr '}'
   *  | T_DOLLAR_OPEN_CURLY_BRACES T_STRING_VARNAME '}'
   *  | T_DOLLAR_OPEN_CURLY_BRACES T_STRING_VARNAME '[' expr ']' '}'
   *  | T_CURLY_OPEN variable '}'
   *  | variable
   *  | variable '[' expr ']'
   *  | variable T_OBJECT_OPERATOR T_STRING
   * ```
   * @return {String|Variable|Expr|Lookup}
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1219
   */
  read_encapsed_string_item: function (isDoubleQuote) {
    const encapsedPart = this.node("encapsedpart");
    let syntax = null;
    let curly = false;
    let result = this.node(),
      offset,
      node,
      name;

    // plain text
    // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1222
    if (this.token === this.tok.T_ENCAPSED_AND_WHITESPACE) {
      const text = this.text();
      this.next();

      // if this.lexer.heredoc_label.first_encaps_node -> remove first indents
      result = result(
        "string",
        false,
        this.version >= 703 && !this.lexer.heredoc_label.finished
          ? this.remove_heredoc_leading_whitespace_chars(
              this.resolve_special_chars(text, isDoubleQuote),
              this.lexer.heredoc_label.indentation,
              this.lexer.heredoc_label.indentation_uses_spaces,
              this.lexer.heredoc_label.first_encaps_node
            )
          : text,
        false,
        text
      );
    } else if (this.token === this.tok.T_DOLLAR_OPEN_CURLY_BRACES) {
      syntax = "simple";
      curly = true;
      // dynamic variable name
      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1239
      name = null;
      if (this.next().token === this.tok.T_STRING_VARNAME) {
        name = this.node("variable");
        const varName = this.text();
        this.next();
        // check if lookup an offset
        // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1243
        if (this.token === "[") {
          name = name(varName, false);
          node = this.node("offsetlookup");
          offset = this.next().read_expr();
          this.expect("]") && this.next();
          result = node(name, offset);
        } else {
          result = name(varName, false);
        }
      } else {
        result = result("variable", this.read_expr(), false);
      }
      this.expect("}") && this.next();
    } else if (this.token === this.tok.T_CURLY_OPEN) {
      // expression
      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1246
      syntax = "complex";
      result.destroy();
      result = this.next().read_variable(false, false);
      this.expect("}") && this.next();
    } else if (this.token === this.tok.T_VARIABLE) {
      syntax = "simple";
      // plain variable
      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1231
      result.destroy();
      result = this.read_simple_variable();

      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1233
      if (this.token === "[") {
        node = this.node("offsetlookup");
        offset = this.next().read_encaps_var_offset();
        this.expect("]") && this.next();
        result = node(result, offset);
      }

      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1236
      if (this.token === this.tok.T_OBJECT_OPERATOR) {
        node = this.node("propertylookup");
        this.next().expect(this.tok.T_STRING);
        const what = this.node("identifier");
        name = this.text();
        this.next();
        result = node(result, what(name));
      }

      // error / fallback
    } else {
      this.expect(this.tok.T_ENCAPSED_AND_WHITESPACE);
      const value = this.text();
      this.next();
      // consider it as string
      result.destroy();
      result = result("string", false, value, false, value);
    }

    // reset first_encaps_node to false after access any node
    this.lexer.heredoc_label.first_encaps_node = false;
    return encapsedPart(result, syntax, curly);
  },
  /**
   * Reads an encapsed string
   */
  read_encapsed_string: function (expect, isBinary = false) {
    const labelStart = this.lexer.yylloc.first_offset;
    let node = this.node("encapsed");
    this.next();
    const start = this.lexer.yylloc.prev_offset - (isBinary ? 1 : 0);
    const value = [];
    let type = null;

    if (expect === "`") {
      type = this.ast.encapsed.TYPE_SHELL;
    } else if (expect === '"') {
      type = this.ast.encapsed.TYPE_STRING;
    } else {
      type = this.ast.encapsed.TYPE_HEREDOC;
    }

    // reading encapsed parts
    while (this.token !== expect && this.token !== this.EOF) {
      value.push(this.read_encapsed_string_item(true));
    }
    if (
      value.length > 0 &&
      value[value.length - 1].kind === "encapsedpart" &&
      value[value.length - 1].expression.kind === "string"
    ) {
      const node = value[value.length - 1].expression;
      const lastCh = node.value[node.value.length - 1];
      if (lastCh === "\n") {
        if (node.value[node.value.length - 2] === "\r") {
          // windows style
          node.value = node.value.substring(0, node.value.length - 2);
        } else {
          // linux style
          node.value = node.value.substring(0, node.value.length - 1);
        }
      } else if (lastCh === "\r") {
        // mac style
        node.value = node.value.substring(0, node.value.length - 1);
      }
    }
    this.expect(expect) && this.next();
    const raw = this.lexer._input.substring(
      type === "heredoc" ? labelStart : start - 1,
      this.lexer.yylloc.first_offset
    );
    node = node(value, raw, type);

    if (expect === this.tok.T_END_HEREDOC) {
      node.label = this.lexer.heredoc_label.label;
      this.lexer.heredoc_label.finished = true;
    }
    return node;
  },
  /**
   * Constant token
   */
  get_magic_constant: function () {
    const result = this.node("magic");
    const name = this.text();
    this.next();
    return result(name.toUpperCase(), name);
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/statement.js":
/*!*********************************************************!*\
  !*** ./node_modules/php-parser/src/parser/statement.js ***!
  \*********************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * reading a list of top statements (helper for top_statement*)
   * ```ebnf
   *  top_statements ::= top_statement*
   * ```
   */
  read_top_statements: function () {
    let result = [];
    while (this.token !== this.EOF && this.token !== "}") {
      const statement = this.read_top_statement();
      if (statement) {
        if (Array.isArray(statement)) {
          result = result.concat(statement);
        } else {
          result.push(statement);
        }
      }
    }
    return result;
  },
  /**
   * reading a top statement
   * ```ebnf
   *  top_statement ::=
   *       namespace | function | class
   *       | interface | trait
   *       | use_statements | const_list
   *       | statement
   * ```
   */
  read_top_statement: function () {
    switch (this.token) {
      case this.tok.T_FUNCTION:
        return this.read_function(false, false);
      // optional flags
      case this.tok.T_ABSTRACT:
      case this.tok.T_FINAL:
      case this.tok.T_CLASS:
        return this.read_class_declaration_statement();
      case this.tok.T_INTERFACE:
        return this.read_interface_declaration_statement();
      case this.tok.T_TRAIT:
        return this.read_trait_declaration_statement();
      case this.tok.T_USE:
        return this.read_use_statement();
      case this.tok.T_CONST: {
        const result = this.node("constantstatement");
        const items = this.next().read_const_list();
        this.expectEndOfStatement();
        return result(null, items);
      }
      case this.tok.T_NAMESPACE:
        return this.read_namespace();
      case this.tok.T_HALT_COMPILER: {
        const result = this.node("halt");
        if (this.next().expect("(")) this.next();
        if (this.expect(")")) this.next();
        this.expect(";");
        this.lexer.done = true;
        return result(this.lexer._input.substring(this.lexer.offset));
      }
      default:
        return this.read_statement();
    }
  },
  /**
   * reads a list of simple inner statements (helper for inner_statement*)
   * ```ebnf
   *  inner_statements ::= inner_statement*
   * ```
   */
  read_inner_statements: function () {
    let result = [];
    while (this.token != this.EOF && this.token !== "}") {
      const statement = this.read_inner_statement();
      if (statement) {
        if (Array.isArray(statement)) {
          result = result.concat(statement);
        } else {
          result.push(statement);
        }
      }
    }
    return result;
  },
  /**
   * Reads a list of constants declaration
   * ```ebnf
   *   const_list ::= T_CONST T_STRING '=' expr (',' T_STRING '=' expr)* ';'
   * ```
   */
  read_const_list: function () {
    return this.read_list(
      function () {
        this.expect(this.tok.T_STRING);
        const result = this.node("constant");
        let constName = this.node("identifier");
        const name = this.text();
        this.next();
        constName = constName(name);
        if (this.expect("=")) {
          return result(constName, this.next().read_expr());
        } else {
          // fallback
          return result(constName, null);
        }
      },
      ",",
      false
    );
  },
  /**
   * Reads a list of constants declaration
   * ```ebnf
   *   declare_list ::= IDENTIFIER '=' expr (',' IDENTIFIER '=' expr)*
   * ```
   * @retrurn {Array}
   */
  read_declare_list: function () {
    const result = [];
    while (this.token != this.EOF && this.token !== ")") {
      this.expect(this.tok.T_STRING);
      const directive = this.node("declaredirective");
      let key = this.node("identifier");
      const name = this.text();
      this.next();
      key = key(name);
      let value = null;
      if (this.expect("=")) {
        value = this.next().read_expr();
      }
      result.push(directive(key, value));
      if (this.token !== ",") break;
      this.next();
    }
    return result;
  },
  /**
   * reads a simple inner statement
   * ```ebnf
   *  inner_statement ::= '{' inner_statements '}' | token
   * ```
   */
  read_inner_statement: function () {
    switch (this.token) {
      case this.tok.T_FUNCTION:
        return this.read_function(false, false);
      // optional flags
      case this.tok.T_ABSTRACT:
      case this.tok.T_FINAL:
      case this.tok.T_CLASS:
        return this.read_class_declaration_statement();
      case this.tok.T_INTERFACE:
        return this.read_interface_declaration_statement();
      case this.tok.T_TRAIT:
        return this.read_trait_declaration_statement();
      case this.tok.T_HALT_COMPILER: {
        this.raiseError(
          "__HALT_COMPILER() can only be used from the outermost scope"
        );
        // fallback : returns a node but does not stop the parsing
        let node = this.node("halt");
        this.next().expect("(") && this.next();
        this.expect(")") && this.next();
        node = node(this.lexer._input.substring(this.lexer.offset));
        this.expect(";") && this.next();
        return node;
      }
      default:
        return this.read_statement();
    }
  },
  /**
   * Reads statements
   */
  read_statement: function () {
    switch (this.token) {
      case "{":
        return this.read_code_block(false);

      case this.tok.T_IF:
        return this.read_if();

      case this.tok.T_SWITCH:
        return this.read_switch();

      case this.tok.T_FOR:
        return this.read_for();

      case this.tok.T_FOREACH:
        return this.read_foreach();

      case this.tok.T_WHILE:
        return this.read_while();

      case this.tok.T_DO:
        return this.read_do();

      case this.tok.T_COMMENT:
        return this.read_comment();

      case this.tok.T_DOC_COMMENT:
        return this.read_doc_comment();

      case this.tok.T_RETURN: {
        const result = this.node("return");
        this.next();
        const expr = this.read_optional_expr(";");
        this.expectEndOfStatement();
        return result(expr);
      }

      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L429
      case this.tok.T_BREAK:
      case this.tok.T_CONTINUE: {
        const result = this.node(
          this.token === this.tok.T_CONTINUE ? "continue" : "break"
        );
        this.next();
        const level = this.read_optional_expr(";");
        this.expectEndOfStatement();
        return result(level);
      }

      case this.tok.T_GLOBAL: {
        const result = this.node("global");
        const items = this.next().read_list(this.read_simple_variable, ",");
        this.expectEndOfStatement();
        return result(items);
      }

      case this.tok.T_STATIC: {
        const current = [this.token, this.lexer.getState()];
        const result = this.node();
        if (this.next().token === this.tok.T_DOUBLE_COLON) {
          // static keyword for a class
          this.lexer.tokens.push(current);
          const expr = this.next().read_expr();
          this.expectEndOfStatement(expr);
          return result("expressionstatement", expr);
        }
        if (this.token === this.tok.T_FUNCTION) {
          return this.read_function(true, [0, 1, 0]);
        }
        const items = this.read_variable_declarations();
        this.expectEndOfStatement();
        return result("static", items);
      }

      case this.tok.T_ECHO: {
        const result = this.node("echo");
        const text = this.text();
        const shortForm = text === "<?=" || text === "<%=";
        const expressions = this.next().read_function_list(this.read_expr, ",");
        this.expectEndOfStatement();
        return result(expressions, shortForm);
      }

      case this.tok.T_INLINE_HTML: {
        const value = this.text();
        let prevChar =
          this.lexer.yylloc.first_offset > 0
            ? this.lexer._input[this.lexer.yylloc.first_offset - 1]
            : null;
        const fixFirstLine = prevChar === "\r" || prevChar === "\n";
        // revert back the first stripped line
        if (fixFirstLine) {
          if (
            prevChar === "\n" &&
            this.lexer.yylloc.first_offset > 1 &&
            this.lexer._input[this.lexer.yylloc.first_offset - 2] === "\r"
          ) {
            prevChar = "\r\n";
          }
        }
        const result = this.node("inline");
        this.next();
        return result(value, fixFirstLine ? prevChar + value : value);
      }

      case this.tok.T_UNSET: {
        const result = this.node("unset");
        this.next().expect("(") && this.next();
        const variables = this.read_function_list(this.read_variable, ",");
        this.expect(")") && this.next();
        this.expect(";") && this.next();
        return result(variables);
      }

      case this.tok.T_DECLARE: {
        const result = this.node("declare");
        const body = [];
        let mode;
        this.next().expect("(") && this.next();
        const directives = this.read_declare_list();
        this.expect(")") && this.next();
        if (this.token === ":") {
          this.next();
          while (
            this.token != this.EOF &&
            this.token !== this.tok.T_ENDDECLARE
          ) {
            // @todo : check declare_statement from php / not valid
            body.push(this.read_top_statement());
          }
          if (
            body.length === 0 &&
            this.extractDoc &&
            this._docs.length > this._docIndex
          ) {
            body.push(this.node("noop")());
          }
          this.expect(this.tok.T_ENDDECLARE) && this.next();
          this.expectEndOfStatement();
          mode = this.ast.declare.MODE_SHORT;
        } else if (this.token === "{") {
          this.next();
          while (this.token != this.EOF && this.token !== "}") {
            // @todo : check declare_statement from php / not valid
            body.push(this.read_top_statement());
          }
          if (
            body.length === 0 &&
            this.extractDoc &&
            this._docs.length > this._docIndex
          ) {
            body.push(this.node("noop")());
          }
          this.expect("}") && this.next();
          mode = this.ast.declare.MODE_BLOCK;
        } else {
          this.expect(";") && this.next();
          mode = this.ast.declare.MODE_NONE;
        }
        return result(directives, body, mode);
      }

      case this.tok.T_TRY:
        return this.read_try();

      case this.tok.T_THROW: {
        const result = this.node("throw");
        const expr = this.next().read_expr();
        this.expectEndOfStatement();
        return result(expr);
      }

      // ignore this (extra ponctuation)
      case ";": {
        this.next();
        return null;
      }

      case this.tok.T_STRING: {
        const result = this.node();
        const current = [this.token, this.lexer.getState()];
        const labelNameText = this.text();
        let labelName = this.node("identifier");
        // AST : https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L457
        if (this.next().token === ":") {
          labelName = labelName(labelNameText);
          this.next();
          return result("label", labelName);
        } else {
          labelName.destroy();
        }

        // default fallback expr / T_STRING '::' (etc...)
        result.destroy();
        this.lexer.tokens.push(current);
        const statement = this.node("expressionstatement");
        const expr = this.next().read_expr();
        this.expectEndOfStatement(expr);
        return statement(expr);
      }

      case this.tok.T_GOTO: {
        const result = this.node("goto");
        let labelName = null;
        if (this.next().expect(this.tok.T_STRING)) {
          labelName = this.node("identifier");
          const name = this.text();
          this.next();
          labelName = labelName(name);
          this.expectEndOfStatement();
        }
        return result(labelName);
      }

      default: {
        // default fallback expr
        const statement = this.node("expressionstatement");
        const expr = this.read_expr();
        this.expectEndOfStatement(expr);
        return statement(expr);
      }
    }
  },
  /**
   * ```ebnf
   *  code_block ::= '{' (inner_statements | top_statements) '}'
   * ```
   */
  read_code_block: function (top) {
    const result = this.node("block");
    this.expect("{") && this.next();
    const body = top
      ? this.read_top_statements()
      : this.read_inner_statements();
    if (
      body.length === 0 &&
      this.extractDoc &&
      this._docs.length > this._docIndex
    ) {
      body.push(this.node("noop")());
    }
    this.expect("}") && this.next();
    return result(null, body);
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/switch.js":
/*!******************************************************!*\
  !*** ./node_modules/php-parser/src/parser/switch.js ***!
  \******************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads a switch statement
   * ```ebnf
   *  switch ::= T_SWITCH '(' expr ')' switch_case_list
   * ```
   * @return {Switch}
   * @see http://php.net/manual/en/control-structures.switch.php
   */
  read_switch: function () {
    const result = this.node("switch");
    this.expect(this.tok.T_SWITCH) && this.next();
    this.expect("(") && this.next();
    const test = this.read_expr();
    this.expect(")") && this.next();
    const shortForm = this.token === ":";
    const body = this.read_switch_case_list();
    return result(test, body, shortForm);
  },
  /**
   * ```ebnf
   *  switch_case_list ::= '{' ';'? case_list* '}' | ':' ';'? case_list* T_ENDSWITCH ';'
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L566
   */
  read_switch_case_list: function () {
    // DETECT SWITCH MODE
    let expect = null;
    const result = this.node("block");
    const items = [];
    if (this.token === "{") {
      expect = "}";
    } else if (this.token === ":") {
      expect = this.tok.T_ENDSWITCH;
    } else {
      this.expect(["{", ":"]);
    }
    this.next();
    // OPTIONNAL ';'
    // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L570
    if (this.token === ";") {
      this.next();
    }
    // EXTRACTING CASES
    while (this.token !== this.EOF && this.token !== expect) {
      items.push(this.read_case_list(expect));
    }
    if (
      items.length === 0 &&
      this.extractDoc &&
      this._docs.length > this._docIndex
    ) {
      items.push(this.node("noop")());
    }
    // CHECK END TOKEN
    this.expect(expect) && this.next();
    if (expect === this.tok.T_ENDSWITCH) {
      this.expectEndOfStatement();
    }
    return result(null, items);
  },
  /**
   * ```ebnf
   *   case_list ::= ((T_CASE expr) | T_DEFAULT) (':' | ';') inner_statement*
   * ```
   */
  read_case_list: function (stopToken) {
    const result = this.node("case");
    let test = null;
    if (this.token === this.tok.T_CASE) {
      test = this.next().read_expr();
    } else if (this.token === this.tok.T_DEFAULT) {
      // the default entry - no condition
      this.next();
    } else {
      this.expect([this.tok.T_CASE, this.tok.T_DEFAULT]);
    }
    // case_separator
    this.expect([":", ";"]) && this.next();
    const body = this.node("block");
    const items = [];
    while (
      this.token !== this.EOF &&
      this.token !== stopToken &&
      this.token !== this.tok.T_CASE &&
      this.token !== this.tok.T_DEFAULT
    ) {
      items.push(this.read_inner_statement());
    }
    return result(test, body(null, items));
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/try.js":
/*!***************************************************!*\
  !*** ./node_modules/php-parser/src/parser/try.js ***!
  \***************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * ```ebnf
   *  try ::= T_TRY '{' inner_statement* '}'
   *          (
   *              T_CATCH '(' namespace_name variable ')' '{'  inner_statement* '}'
   *          )*
   *          (T_FINALLY '{' inner_statement* '}')?
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L448
   * @return {Try}
   */
  read_try: function () {
    this.expect(this.tok.T_TRY);
    const result = this.node("try");
    let always = null;
    const catches = [];
    const body = this.next().read_statement();
    // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L455
    while (this.token === this.tok.T_CATCH) {
      const item = this.node("catch");
      this.next().expect("(") && this.next();
      const what = this.read_list(this.read_namespace_name, "|", false);
      const variable = this.read_variable(true, false);
      this.expect(")");
      catches.push(item(this.next().read_statement(), what, variable));
    }
    if (this.token === this.tok.T_FINALLY) {
      always = this.next().read_statement();
    }
    return result(body, catches, always);
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/utils.js":
/*!*****************************************************!*\
  !*** ./node_modules/php-parser/src/parser/utils.js ***!
  \*****************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads a short form of tokens
   * @param {Number} token - The ending token
   * @return {Block}
   */
  read_short_form: function (token) {
    const body = this.node("block");
    const items = [];
    if (this.expect(":")) this.next();
    while (this.token != this.EOF && this.token !== token) {
      items.push(this.read_inner_statement());
    }
    if (
      items.length === 0 &&
      this.extractDoc &&
      this._docs.length > this._docIndex
    ) {
      items.push(this.node("noop")());
    }
    if (this.expect(token)) this.next();
    this.expectEndOfStatement();
    return body(null, items);
  },

  /**
   * https://wiki.php.net/rfc/trailing-comma-function-calls
   * @param {*} item
   * @param {*} separator
   */
  read_function_list: function (item, separator) {
    const result = [];
    do {
      if (this.token == separator && this.version >= 703 && result.length > 0) {
        result.push(this.node("noop")());
        break;
      }
      result.push(item.apply(this, []));
      if (this.token != separator) {
        break;
      }
      if (this.next().token == ")" && this.version >= 703) {
        break;
      }
    } while (this.token != this.EOF);
    return result;
  },

  /**
   * Helper : reads a list of tokens / sample : T_STRING ',' T_STRING ...
   * ```ebnf
   * list ::= separator? ( item separator )* item
   * ```
   */
  read_list: function (item, separator, preserveFirstSeparator) {
    const result = [];

    if (this.token == separator) {
      if (preserveFirstSeparator) {
        result.push(typeof item === "function" ? this.node("noop")() : null);
      }
      this.next();
    }

    if (typeof item === "function") {
      do {
        const itemResult = item.apply(this, []);
        if (itemResult) {
          result.push(itemResult);
        }
        if (this.token != separator) {
          break;
        }
      } while (this.next().token != this.EOF);
    } else {
      if (this.expect(item)) {
        result.push(this.text());
      } else {
        return [];
      }
      while (this.next().token != this.EOF) {
        if (this.token != separator) break;
        // trim current separator & check item
        if (this.next().token != item) break;
        result.push(this.text());
      }
    }
    return result;
  },

  /**
   * Reads a list of names separated by a comma
   *
   * ```ebnf
   * name_list ::= namespace (',' namespace)*
   * ```
   *
   * Sample code :
   * ```php
   * <?php class foo extends bar, baz { }
   * ```
   *
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L726
   * @return {Reference[]}
   */
  read_name_list: function () {
    return this.read_list(this.read_namespace_name, ",", false);
  },

  /**
   * Reads the byref token and assign it to the specified node
   * @param {*} cb
   */
  read_byref: function (cb) {
    let byref = this.node("byref");
    this.next();
    byref = byref(null);
    const result = cb();
    if (result) {
      this.ast.swapLocations(result, byref, result, this);
      result.byref = true;
    }
    return result;
  },

  /**
   * Reads a list of variables declarations
   *
   * ```ebnf
   * variable_declaration ::= T_VARIABLE ('=' expr)?*
   * variable_declarations ::= variable_declaration (',' variable_declaration)*
   * ```
   *
   * Sample code :
   * ```php
   * <?php static $a = 'hello', $b = 'world';
   * ```
   * @return {StaticVariable[]} Returns an array composed by a list of variables, or
   * assign values
   */
  read_variable_declarations: function () {
    return this.read_list(function () {
      const node = this.node("staticvariable");
      let variable = this.node("variable");
      // plain variable name
      if (this.expect(this.tok.T_VARIABLE)) {
        const name = this.text().substring(1);
        this.next();
        variable = variable(name, false);
      } else {
        variable = variable("#ERR", false);
      }
      if (this.token === "=") {
        return node(variable, this.next().read_expr());
      } else {
        return variable;
      }
    }, ",");
  },

  /*
   * Reads class extends
   */
  read_extends_from: function () {
    if (this.token === this.tok.T_EXTENDS) {
      return this.next().read_namespace_name();
    }

    return null;
  },

  /*
   * Reads interface extends list
   */
  read_interface_extends_list: function () {
    if (this.token === this.tok.T_EXTENDS) {
      return this.next().read_name_list();
    }

    return null;
  },

  /*
   * Reads implements list
   */
  read_implements_list: function () {
    if (this.token === this.tok.T_IMPLEMENTS) {
      return this.next().read_name_list();
    }

    return null;
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/parser/variable.js":
/*!********************************************************!*\
  !*** ./node_modules/php-parser/src/parser/variable.js ***!
  \********************************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads a variable
   *
   * ```ebnf
   *   variable ::= &? ...complex @todo
   * ```
   *
   * Some samples of parsed code :
   * ```php
   *  &$var                      // simple var
   *  $var                      // simple var
   *  classname::CONST_NAME     // dynamic class name with const retrieval
   *  foo()                     // function call
   *  $var->func()->property    // chained calls
   * ```
   */
  read_variable: function (read_only, encapsed) {
    let result;

    // check the byref flag
    if (this.token === "&") {
      return this.read_byref(
        this.read_variable.bind(this, read_only, encapsed)
      );
    }

    // reads the entry point
    if (this.is([this.tok.T_VARIABLE, "$"])) {
      result = this.read_reference_variable(encapsed);
    } else if (
      this.is([
        this.tok.T_NS_SEPARATOR,
        this.tok.T_STRING,
        this.tok.T_NAMESPACE,
      ])
    ) {
      result = this.node();
      const name = this.read_namespace_name();
      if (
        this.token != this.tok.T_DOUBLE_COLON &&
        this.token != "(" &&
        ["parentreference", "selfreference"].indexOf(name.kind) === -1
      ) {
        // @see parser.js line 130 : resolves a conflict with scalar
        const literal = name.name.toLowerCase();
        if (literal === "true") {
          result = name.destroy(result("boolean", true, name.name));
        } else if (literal === "false") {
          result = name.destroy(result("boolean", false, name.name));
        } else if (literal === "null") {
          result = name.destroy(result("nullkeyword", name.name));
        } else {
          result.destroy(name);
          result = name;
        }
      } else {
        // @fixme possible #193 bug
        result.destroy(name);
        result = name;
      }
    } else if (this.token === this.tok.T_STATIC) {
      result = this.node("staticreference");
      const raw = this.text();
      this.next();
      result = result(raw);
    } else {
      this.expect("VARIABLE");
    }

    // static mode
    if (this.token === this.tok.T_DOUBLE_COLON) {
      result = this.read_static_getter(result, encapsed);
    }

    return this.recursive_variable_chain_scan(result, read_only, encapsed);
  },

  // resolves a static call
  read_static_getter: function (what, encapsed) {
    const result = this.node("staticlookup");
    let offset, name;
    if (this.next().is([this.tok.T_VARIABLE, "$"])) {
      offset = this.read_reference_variable(encapsed);
    } else if (
      this.token === this.tok.T_STRING ||
      this.token === this.tok.T_CLASS ||
      (this.version >= 700 && this.is("IDENTIFIER"))
    ) {
      offset = this.node("identifier");
      name = this.text();
      this.next();
      offset = offset(name);
    } else if (this.token === "{") {
      offset = this.node("literal");
      name = this.next().read_expr();
      this.expect("}") && this.next();
      offset = offset("literal", name, null);
      this.expect("(");
    } else {
      this.error([this.tok.T_VARIABLE, this.tok.T_STRING]);
      // graceful mode : set getter as error node and continue
      offset = this.node("identifier");
      name = this.text();
      this.next();
      offset = offset(name);
    }
    return result(what, offset);
  },

  read_what: function (is_static_lookup = false) {
    let what = null;
    let name = null;
    switch (this.next().token) {
      case this.tok.T_STRING:
        what = this.node("identifier");
        name = this.text();
        this.next();
        what = what(name);

        if (is_static_lookup && this.token === this.tok.T_OBJECT_OPERATOR) {
          this.error();
        }
        break;
      case this.tok.T_VARIABLE:
        what = this.node("variable");
        name = this.text().substring(1);
        this.next();
        what = what(name, false);
        break;
      case "$":
        what = this.node();
        this.next().expect(["$", "{", this.tok.T_VARIABLE]);
        if (this.token === "{") {
          // $obj->${$varname}
          name = this.next().read_expr();
          this.expect("}") && this.next();
          what = what("variable", name, true);
        } else {
          // $obj->$$varname
          name = this.read_expr();
          what = what("variable", name, false);
        }
        break;
      case "{":
        what = this.node("encapsedpart");
        name = this.next().read_expr();
        this.expect("}") && this.next();
        what = what(name, "complex", false);
        break;
      default:
        this.error([this.tok.T_STRING, this.tok.T_VARIABLE, "$", "{"]);
        // graceful mode : set what as error mode & continue
        what = this.node("identifier");
        name = this.text();
        this.next();
        what = what(name);
        break;
    }

    return what;
  },

  recursive_variable_chain_scan: function (result, read_only, encapsed) {
    let node, offset;
    recursive_scan_loop: while (this.token != this.EOF) {
      switch (this.token) {
        case "(":
          if (read_only) {
            // @fixme : add more informations & test
            return result;
          } else {
            result = this.node("call")(result, this.read_argument_list());
          }
          break;
        case "[":
        case "{": {
          const backet = this.token;
          const isSquareBracket = backet === "[";
          node = this.node("offsetlookup");
          this.next();
          offset = false;
          if (encapsed) {
            offset = this.read_encaps_var_offset();
            this.expect(isSquareBracket ? "]" : "}") && this.next();
          } else {
            const isCallableVariable = isSquareBracket
              ? this.token !== "]"
              : this.token !== "}";
            // callable_variable : https://github.com/php/php-src/blob/493524454d66adde84e00d249d607ecd540de99f/Zend/zend_language_parser.y#L1122
            if (isCallableVariable) {
              offset = this.read_expr();
              this.expect(isSquareBracket ? "]" : "}") && this.next();
            } else {
              this.next();
            }
          }
          result = node(result, offset);
          break;
        }
        case this.tok.T_DOUBLE_COLON:
          // @see https://github.com/glayzzle/php-parser/issues/107#issuecomment-354104574
          if (
            result.kind === "staticlookup" &&
            result.offset.kind === "identifier"
          ) {
            this.error();
          }

          node = this.node("staticlookup");
          result = node(result, this.read_what(true));

          // fix 185
          // static lookup dereferencables are limited to staticlookup over functions
          /*if (dereferencable && this.token !== "(") {
            this.error("(");
          }*/
          break;
        case this.tok.T_OBJECT_OPERATOR: {
          node = this.node("propertylookup");
          result = node(result, this.read_what());
          break;
        }
        default:
          break recursive_scan_loop;
      }
    }
    return result;
  },
  /**
   * https://github.com/php/php-src/blob/493524454d66adde84e00d249d607ecd540de99f/Zend/zend_language_parser.y#L1231
   */
  read_encaps_var_offset: function () {
    let offset = this.node();
    if (this.token === this.tok.T_STRING) {
      const text = this.text();
      this.next();
      offset = offset("identifier", text);
    } else if (this.token === this.tok.T_NUM_STRING) {
      const num = this.text();
      this.next();
      offset = offset("number", num, null);
    } else if (this.token === "-") {
      this.next();
      const num = -1 * this.text();
      this.expect(this.tok.T_NUM_STRING) && this.next();
      offset = offset("number", num, null);
    } else if (this.token === this.tok.T_VARIABLE) {
      const name = this.text().substring(1);
      this.next();
      offset = offset("variable", name, false);
    } else {
      this.expect([
        this.tok.T_STRING,
        this.tok.T_NUM_STRING,
        "-",
        this.tok.T_VARIABLE,
      ]);
      // fallback : consider as identifier
      const text = this.text();
      this.next();
      offset = offset("identifier", text);
    }
    return offset;
  },
  /**
   * ```ebnf
   *  reference_variable ::=  simple_variable ('[' OFFSET ']')* | '{' EXPR '}'
   * ```
   * <code>
   *  $foo[123];      // foo is an array ==> gets its entry
   *  $foo{1};        // foo is a string ==> get the 2nd char offset
   *  ${'foo'}[123];  // get the dynamic var $foo
   *  $foo[123]{1};   // gets the 2nd char from the 123 array entry
   * </code>
   */
  read_reference_variable: function (encapsed) {
    let result = this.read_simple_variable();
    let offset;
    while (this.token != this.EOF) {
      const node = this.node();
      if (this.token == "{" && !encapsed) {
        // @fixme check coverage, not sure thats working
        offset = this.next().read_expr();
        this.expect("}") && this.next();
        result = node("offsetlookup", result, offset);
      } else {
        node.destroy();
        break;
      }
    }
    return result;
  },
  /**
   * ```ebnf
   *  simple_variable ::= T_VARIABLE | '$' '{' expr '}' | '$' simple_variable
   * ```
   */
  read_simple_variable: function () {
    let result = this.node("variable");
    let name;
    if (
      this.expect([this.tok.T_VARIABLE, "$"]) &&
      this.token === this.tok.T_VARIABLE
    ) {
      // plain variable name
      name = this.text().substring(1);
      this.next();
      result = result(name, false);
    } else {
      if (this.token === "$") this.next();
      // dynamic variable name
      switch (this.token) {
        case "{": {
          const expr = this.next().read_expr();
          this.expect("}") && this.next();
          result = result(expr, true);
          break;
        }
        case "$": // $$$var
          result = result(this.read_simple_variable(), false);
          break;
        case this.tok.T_VARIABLE: {
          // $$var
          name = this.text().substring(1);
          const node = this.node("variable");
          this.next();
          result = result(node(name, false), false);
          break;
        }
        default:
          this.error(["{", "$", this.tok.T_VARIABLE]);
          // graceful mode
          name = this.text();
          this.next();
          result = result(name, false);
      }
    }
    return result;
  },
};


/***/ }),

/***/ "./node_modules/php-parser/src/tokens.js":
/*!***********************************************!*\
  !*** ./node_modules/php-parser/src/tokens.js ***!
  \***********************************************/
/***/ ((module) => {

/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/**
 * PHP AST Tokens
 * @type {Object}
 */
module.exports = {
  values: {
    101: "T_HALT_COMPILER",
    102: "T_USE",
    103: "T_ENCAPSED_AND_WHITESPACE",
    104: "T_OBJECT_OPERATOR",
    105: "T_STRING",
    106: "T_DOLLAR_OPEN_CURLY_BRACES",
    107: "T_STRING_VARNAME",
    108: "T_CURLY_OPEN",
    109: "T_NUM_STRING",
    110: "T_ISSET",
    111: "T_EMPTY",
    112: "T_INCLUDE",
    113: "T_INCLUDE_ONCE",
    114: "T_EVAL",
    115: "T_REQUIRE",
    116: "T_REQUIRE_ONCE",
    117: "T_NAMESPACE",
    118: "T_NS_SEPARATOR",
    119: "T_AS",
    120: "T_IF",
    121: "T_ENDIF",
    122: "T_WHILE",
    123: "T_DO",
    124: "T_FOR",
    125: "T_SWITCH",
    126: "T_BREAK",
    127: "T_CONTINUE",
    128: "T_RETURN",
    129: "T_GLOBAL",
    130: "T_STATIC",
    131: "T_ECHO",
    132: "T_INLINE_HTML",
    133: "T_UNSET",
    134: "T_FOREACH",
    135: "T_DECLARE",
    136: "T_TRY",
    137: "T_THROW",
    138: "T_GOTO",
    139: "T_FINALLY",
    140: "T_CATCH",
    141: "T_ENDDECLARE",
    142: "T_LIST",
    143: "T_CLONE",
    144: "T_PLUS_EQUAL",
    145: "T_MINUS_EQUAL",
    146: "T_MUL_EQUAL",
    147: "T_DIV_EQUAL",
    148: "T_CONCAT_EQUAL",
    149: "T_MOD_EQUAL",
    150: "T_AND_EQUAL",
    151: "T_OR_EQUAL",
    152: "T_XOR_EQUAL",
    153: "T_SL_EQUAL",
    154: "T_SR_EQUAL",
    155: "T_INC",
    156: "T_DEC",
    157: "T_BOOLEAN_OR",
    158: "T_BOOLEAN_AND",
    159: "T_LOGICAL_OR",
    160: "T_LOGICAL_AND",
    161: "T_LOGICAL_XOR",
    162: "T_SL",
    163: "T_SR",
    164: "T_IS_IDENTICAL",
    165: "T_IS_NOT_IDENTICAL",
    166: "T_IS_EQUAL",
    167: "T_IS_NOT_EQUAL",
    168: "T_IS_SMALLER_OR_EQUAL",
    169: "T_IS_GREATER_OR_EQUAL",
    170: "T_INSTANCEOF",
    171: "T_INT_CAST",
    172: "T_DOUBLE_CAST",
    173: "T_STRING_CAST",
    174: "T_ARRAY_CAST",
    175: "T_OBJECT_CAST",
    176: "T_BOOL_CAST",
    177: "T_UNSET_CAST",
    178: "T_EXIT",
    179: "T_PRINT",
    180: "T_YIELD",
    181: "T_YIELD_FROM",
    182: "T_FUNCTION",
    183: "T_DOUBLE_ARROW",
    184: "T_DOUBLE_COLON",
    185: "T_ARRAY",
    186: "T_CALLABLE",
    187: "T_CLASS",
    188: "T_ABSTRACT",
    189: "T_TRAIT",
    190: "T_FINAL",
    191: "T_EXTENDS",
    192: "T_INTERFACE",
    193: "T_IMPLEMENTS",
    194: "T_VAR",
    195: "T_PUBLIC",
    196: "T_PROTECTED",
    197: "T_PRIVATE",
    198: "T_CONST",
    199: "T_NEW",
    200: "T_INSTEADOF",
    201: "T_ELSEIF",
    202: "T_ELSE",
    203: "T_ENDSWITCH",
    204: "T_CASE",
    205: "T_DEFAULT",
    206: "T_ENDFOR",
    207: "T_ENDFOREACH",
    208: "T_ENDWHILE",
    209: "T_CONSTANT_ENCAPSED_STRING",
    210: "T_LNUMBER",
    211: "T_DNUMBER",
    212: "T_LINE",
    213: "T_FILE",
    214: "T_DIR",
    215: "T_TRAIT_C",
    216: "T_METHOD_C",
    217: "T_FUNC_C",
    218: "T_NS_C",
    219: "T_START_HEREDOC",
    220: "T_END_HEREDOC",
    221: "T_CLASS_C",
    222: "T_VARIABLE",
    223: "T_OPEN_TAG",
    224: "T_OPEN_TAG_WITH_ECHO",
    225: "T_CLOSE_TAG",
    226: "T_WHITESPACE",
    227: "T_COMMENT",
    228: "T_DOC_COMMENT",
    229: "T_ELLIPSIS",
    230: "T_COALESCE",
    231: "T_POW",
    232: "T_POW_EQUAL",
    233: "T_SPACESHIP",
    234: "T_COALESCE_EQUAL",
    235: "T_FN",
  },
  names: {
    T_HALT_COMPILER: 101,
    T_USE: 102,
    T_ENCAPSED_AND_WHITESPACE: 103,
    T_OBJECT_OPERATOR: 104,
    T_STRING: 105,
    T_DOLLAR_OPEN_CURLY_BRACES: 106,
    T_STRING_VARNAME: 107,
    T_CURLY_OPEN: 108,
    T_NUM_STRING: 109,
    T_ISSET: 110,
    T_EMPTY: 111,
    T_INCLUDE: 112,
    T_INCLUDE_ONCE: 113,
    T_EVAL: 114,
    T_REQUIRE: 115,
    T_REQUIRE_ONCE: 116,
    T_NAMESPACE: 117,
    T_NS_SEPARATOR: 118,
    T_AS: 119,
    T_IF: 120,
    T_ENDIF: 121,
    T_WHILE: 122,
    T_DO: 123,
    T_FOR: 124,
    T_SWITCH: 125,
    T_BREAK: 126,
    T_CONTINUE: 127,
    T_RETURN: 128,
    T_GLOBAL: 129,
    T_STATIC: 130,
    T_ECHO: 131,
    T_INLINE_HTML: 132,
    T_UNSET: 133,
    T_FOREACH: 134,
    T_DECLARE: 135,
    T_TRY: 136,
    T_THROW: 137,
    T_GOTO: 138,
    T_FINALLY: 139,
    T_CATCH: 140,
    T_ENDDECLARE: 141,
    T_LIST: 142,
    T_CLONE: 143,
    T_PLUS_EQUAL: 144,
    T_MINUS_EQUAL: 145,
    T_MUL_EQUAL: 146,
    T_DIV_EQUAL: 147,
    T_CONCAT_EQUAL: 148,
    T_MOD_EQUAL: 149,
    T_AND_EQUAL: 150,
    T_OR_EQUAL: 151,
    T_XOR_EQUAL: 152,
    T_SL_EQUAL: 153,
    T_SR_EQUAL: 154,
    T_INC: 155,
    T_DEC: 156,
    T_BOOLEAN_OR: 157,
    T_BOOLEAN_AND: 158,
    T_LOGICAL_OR: 159,
    T_LOGICAL_AND: 160,
    T_LOGICAL_XOR: 161,
    T_SL: 162,
    T_SR: 163,
    T_IS_IDENTICAL: 164,
    T_IS_NOT_IDENTICAL: 165,
    T_IS_EQUAL: 166,
    T_IS_NOT_EQUAL: 167,
    T_IS_SMALLER_OR_EQUAL: 168,
    T_IS_GREATER_OR_EQUAL: 169,
    T_INSTANCEOF: 170,
    T_INT_CAST: 171,
    T_DOUBLE_CAST: 172,
    T_STRING_CAST: 173,
    T_ARRAY_CAST: 174,
    T_OBJECT_CAST: 175,
    T_BOOL_CAST: 176,
    T_UNSET_CAST: 177,
    T_EXIT: 178,
    T_PRINT: 179,
    T_YIELD: 180,
    T_YIELD_FROM: 181,
    T_FUNCTION: 182,
    T_DOUBLE_ARROW: 183,
    T_DOUBLE_COLON: 184,
    T_ARRAY: 185,
    T_CALLABLE: 186,
    T_CLASS: 187,
    T_ABSTRACT: 188,
    T_TRAIT: 189,
    T_FINAL: 190,
    T_EXTENDS: 191,
    T_INTERFACE: 192,
    T_IMPLEMENTS: 193,
    T_VAR: 194,
    T_PUBLIC: 195,
    T_PROTECTED: 196,
    T_PRIVATE: 197,
    T_CONST: 198,
    T_NEW: 199,
    T_INSTEADOF: 200,
    T_ELSEIF: 201,
    T_ELSE: 202,
    T_ENDSWITCH: 203,
    T_CASE: 204,
    T_DEFAULT: 205,
    T_ENDFOR: 206,
    T_ENDFOREACH: 207,
    T_ENDWHILE: 208,
    T_CONSTANT_ENCAPSED_STRING: 209,
    T_LNUMBER: 210,
    T_DNUMBER: 211,
    T_LINE: 212,
    T_FILE: 213,
    T_DIR: 214,
    T_TRAIT_C: 215,
    T_METHOD_C: 216,
    T_FUNC_C: 217,
    T_NS_C: 218,
    T_START_HEREDOC: 219,
    T_END_HEREDOC: 220,
    T_CLASS_C: 221,
    T_VARIABLE: 222,
    T_OPEN_TAG: 223,
    T_OPEN_TAG_WITH_ECHO: 224,
    T_CLOSE_TAG: 225,
    T_WHITESPACE: 226,
    T_COMMENT: 227,
    T_DOC_COMMENT: 228,
    T_ELLIPSIS: 229,
    T_COALESCE: 230,
    T_POW: 231,
    T_POW_EQUAL: 232,
    T_SPACESHIP: 233,
    T_COALESCE_EQUAL: 234,
    T_FN: 235,
  },
};


/***/ }),

/***/ "./src/AssetProvider.ts":
/*!******************************!*\
  !*** ./src/AssetProvider.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AssetProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");




class AssetProvider {
    constructor() {
        this.publicFiles = [];
        this.timer = null;
        this.watcher = null;
        this.loadFiles();
        if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders !== undefined) {
            this.watcher = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.createFileSystemWatcher(new vscode__WEBPACK_IMPORTED_MODULE_0__.RelativePattern(vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders[0], "public/**/*"));
            this.watcher.onDidChange((e) => this.onChange());
            this.watcher.onDidCreate((e) => this.onChange());
            this.watcher.onDidDelete((e) => this.onChange());
        }
    }
    provideCompletionItems(document, position, token, context) {
        var out = [];
        var func = _helpers__WEBPACK_IMPORTED_MODULE_2__.default.parseDocumentFunction(document, position);
        if (func === null) {
            return out;
        }
        if (func && (_helpers__WEBPACK_IMPORTED_MODULE_2__.default.tags.asset.functions.some((fn) => func.function.includes(fn)))) {
            for (var i in this.publicFiles) {
                var completeItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(this.publicFiles[i], vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Constant);
                completeItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_2__.default.wordMatchRegex);
                out.push(completeItem);
            }
        }
        return out;
    }
    onChange() {
        var self = this;
        if (self.timer !== null) {
            clearTimeout(self.timer);
        }
        self.timer = setTimeout(function () {
            self.loadFiles();
            self.timer = null;
        }, 2000);
    }
    loadFiles() {
        this.publicFiles = this.getFiles().map((path) => path.replace(/\/?public\/?/g, ""));
    }
    getFiles(scanPath = "public", depth = 0) {
        let out = [];
        try {
            let projectScanPath = _helpers__WEBPACK_IMPORTED_MODULE_2__.default.projectPath(scanPath);
            if (depth <= 10 && fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(projectScanPath)) {
                for (let filePath of fs__WEBPACK_IMPORTED_MODULE_1__.readdirSync(projectScanPath)) {
                    let fullFilePath = projectScanPath + "/" + filePath;
                    if (fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(fullFilePath).isDirectory()) {
                        out = out.concat(this.getFiles(scanPath + "/" + filePath, depth + 1));
                    }
                    else if (fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(fullFilePath).isFile()) {
                        if (filePath[0] != '.' && filePath.endsWith(".php") == false) {
                            out.push(scanPath + "/" + filePath);
                        }
                    }
                }
            }
        }
        catch (exception) {
            console.error(exception);
        }
        return out;
    }
}


/***/ }),

/***/ "./src/AuthProvider.ts":
/*!*****************************!*\
  !*** ./src/AuthProvider.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AuthProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");



class AuthProvider {
    constructor() {
        this.abilities = [];
        this.models = [];
        var self = this;
        self.loadAbilities();
        setInterval(function () {
            self.loadAbilities();
        }, 60000);
    }
    provideCompletionItems(document, position, token, context) {
        var out = [];
        var func = _helpers__WEBPACK_IMPORTED_MODULE_1__.default.parseDocumentFunction(document, position);
        if (func === null) {
            return out;
        }
        if (func && ((func.class && _helpers__WEBPACK_IMPORTED_MODULE_1__.default.tags.auth.classes.some((cls) => func.class.includes(cls))) || _helpers__WEBPACK_IMPORTED_MODULE_1__.default.tags.auth.functions.some((fn) => func.function.includes(fn)))) {
            if (func.paramIndex === 1) {
                for (let i in this.models) {
                    let completeItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(this.models[i].replace(/\\/, '\\\\'), vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Value);
                    completeItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_1__.default.wordMatchRegex);
                    out.push(completeItem);
                }
            }
            else {
                for (let i in this.abilities) {
                    let completeItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(this.abilities[i], vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Value);
                    completeItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_1__.default.wordMatchRegex);
                    out.push(completeItem);
                }
            }
        }
        return out;
    }
    loadAbilities() {
        try {
            var self = this;
            _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getModels().then((models) => self.models = models);
            _helpers__WEBPACK_IMPORTED_MODULE_1__.default.runLaravel(`
                echo json_encode(
                    array_merge(
                        array_keys(Illuminate\\Support\\Facades\\Gate::abilities()),
                        array_values(
                            array_filter(
                                array_unique(
                                    Illuminate\\Support\\Arr::flatten(
                                        array_map(
                                            function ($val, $key) {
                                                return array_map(
                                                    function ($rm) {
                                                        return $rm->getName();
                                                    },
                                                    (new ReflectionClass($val))->getMethods()
                                                );
                                            },
                                            Illuminate\\Support\\Facades\\Gate::policies(),
                                            array_keys(Illuminate\\Support\\Facades\\Gate::policies())
                                        )
                                    )
                                ),
                                function ($an) {return !in_array($an, ['allow', 'deny']);}
                            )
                        )
                    )
                );
               `).then(function (result) {
                var abilities = JSON.parse(result);
                self.abilities = abilities;
            });
        }
        catch (exception) {
            console.error(exception);
        }
    }
}


/***/ }),

/***/ "./src/BladeProvider.ts":
/*!******************************!*\
  !*** ./src/BladeProvider.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BladeProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");



class BladeProvider {
    constructor() {
        this.customDirectives = [];
        var self = this;
        self.loadCustomDirectives();
        setInterval(() => self.loadCustomDirectives(), 600000);
    }
    provideCompletionItems(document, position, token, context) {
        let isBlade = document.languageId == 'blade' || document.languageId == 'laravel-blade' || document.fileName.endsWith('.blade.php');
        if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("LaravelExtraIntellisense").get('disableBlade', false) || isBlade === false) {
            return [];
        }
        var out = this.getDefaultDirectives(document, position);
        for (var i in this.customDirectives) {
            var completeItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem('@' + this.customDirectives[i].name + (this.customDirectives[i].hasParams ? '(...)' : ''), vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Keyword);
            completeItem.insertText = new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@' + this.customDirectives[i].name + (this.customDirectives[i].hasParams ? '(${1})' : ''));
            completeItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_1__.default.wordMatchRegex);
            out.push(completeItem);
        }
        return out;
    }
    loadCustomDirectives() {
        try {
            var self = this;
            //
            _helpers__WEBPACK_IMPORTED_MODULE_1__.default.runLaravel("$out = [];" +
                "foreach (app(Illuminate\\View\\Compilers\\BladeCompiler::class)->getCustomDirectives() as $name => $customDirective) {" +
                "    if ($customDirective instanceof \\Closure) {" +
                "        $out[] = ['name' => $name, 'hasParams' => (new ReflectionFunction($customDirective))->getNumberOfParameters() >= 1];" +
                "    } elseif (is_array($customDirective)) {" +
                "        $out[] = ['name' => $name, 'hasParams' => (new ReflectionMethod($customDirective[0], $customDirective[1]))->getNumberOfParameters() >= 1];" +
                "    }" +
                "}" +
                "echo json_encode($out);")
                .then(function (result) {
                var customDirectives = JSON.parse(result);
                self.customDirectives = customDirectives;
            });
        }
        catch (exception) {
            console.error(exception);
        }
    }
    getDefaultDirectives(document, position) {
        var snippets = {
            '@if(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@if (${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endif'),
            '@error(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@error(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@enderror'),
            '@if(...) ... @else ... @endif': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@if (${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@else\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${3}\n' + '@endif'),
            '@foreach(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@foreach (${1} as ${2})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${3}\n' + '@endforeach'),
            '@forelse(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@forelse (${1} as ${2})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${3}\n' + '@empty\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${4}\n' + '@endforelse'),
            '@for(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@for (${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endfor'),
            '@while(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@while (${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endwhile'),
            '@switch(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@switch(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '@case(${2})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer().repeat(2) + '${3}\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer().repeat(2) + '@break\n\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '@default\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer().repeat(2) + '${4}\n@endswitch'),
            '@case(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@case(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n@break'),
            '@break': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@break'),
            '@continue': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@continue'),
            '@break(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@break(${1})'),
            '@continue(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@continue(${1})'),
            '@default': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@default'),
            '@extends(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@extends(${1})'),
            '@empty': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@empty'),
            '@verbatim ...': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@verbatim\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endverbatim'),
            '@json(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@json(${1})'),
            '@elseif (...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@elseif (${1})'),
            '@else': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@else'),
            '@unless(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@unless (${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endunless'),
            '@isset(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@isset(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endisset'),
            '@empty(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@empty(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endempty'),
            '@auth': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@auth\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${1}\n' + '@endauth'),
            '@guest': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@guest\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${1}\n' + '@endguest'),
            '@auth(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@auth(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endauth'),
            '@guest(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@guest(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endguest'),
            '@can(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@can(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endcan'),
            '@cannot(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@cannot(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endcannot'),
            '@elsecan(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@elsecan(${1})'),
            '@elsecannot(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@elsecannot(${1})'),
            '@production': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@production\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${1}\n' + '@endproduction'),
            '@env(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@env(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endenv'),
            '@hasSection(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@hasSection(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endif'),
            '@sectionMissing(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@sectionMissing(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endif'),
            '@include(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@include(${1})'),
            '@includeIf(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@includeIf(${1})'),
            '@includeWhen(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@includeWhen(${1}, ${2})'),
            '@includeUnless(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@includeUnless(${1}, ${2})'),
            '@includeFirst(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@includeFirst(${1})'),
            '@each(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@each(${1}, ${2}, ${3})'),
            '@once': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@production\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${1}\n' + '@endonce'),
            '@yield(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@yield(${1})'),
            '@slot(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@slot(${1})'),
            '@stack(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@method(${1})'),
            '@push(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@push(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endpush'),
            '@prepend(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@prepend(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endprepend'),
            '@php': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@php\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${1}\n' + '@endphp'),
            '@component(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@component(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endcomponent'),
            '@section(...) ... @endsection': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@section(${1})\n' + _helpers__WEBPACK_IMPORTED_MODULE_1__.default.getSpacer() + '${2}\n' + '@endsection'),
            '@section(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@section(${1})'),
            '@props(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@props(${1})'),
            '@show': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@show'),
            '@stop': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@stop'),
            '@parent': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@parent'),
            '@csrf': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@csrf'),
            '@method(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@method(${1})'),
            '@inject(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@inject(${1}, ${2})'),
            '@dump(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@dump(${1})'),
            '@dd(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@dd(${1})'),
            '@lang(...)': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@lang(${1})'),
            '@endif': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endif'),
            '@enderror': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@enderror'),
            '@endforeach': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endforeach'),
            '@endforelse': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endforelse'),
            '@endfor': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endfor'),
            '@endwhile': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endwhile'),
            '@endswitch': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endswitch'),
            '@endverbatim': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endverbatim'),
            '@endunless': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endunless'),
            '@endisset': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endisset'),
            '@endempty': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endempty'),
            '@endauth': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endauth'),
            '@endguest': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endguest'),
            '@endproduction': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endproduction'),
            '@endenv': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endenv'),
            '@endonce': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endonce'),
            '@endpush': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endpush'),
            '@endprepend': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endprepend'),
            '@endphp': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endphp'),
            '@endcomponent': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endcomponent'),
            '@endsection': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endsection'),
            '@endslot': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endslot'),
            '@endcan': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endcan'),
            '@endcannot': new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString('@endcannot'),
        };
        var out = [];
        for (let snippet in snippets) {
            var completeItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(snippet, vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Keyword);
            if (snippets[snippet] instanceof vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString) {
                completeItem.insertText = snippets[snippet];
            }
            completeItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_1__.default.wordMatchRegex);
            out.push(completeItem);
        }
        return out;
    }
}


/***/ }),

/***/ "./src/ConfigProvider.ts":
/*!*******************************!*\
  !*** ./src/ConfigProvider.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ConfigProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");



class ConfigProvider {
    constructor() {
        this.timer = null;
        this.configs = [];
        this.watcher = null;
        var self = this;
        self.loadConfigs();
        if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders !== undefined) {
            this.watcher = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.createFileSystemWatcher(new vscode__WEBPACK_IMPORTED_MODULE_0__.RelativePattern(vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders[0], "config/{,*,**/*}.php"));
            this.watcher.onDidChange((e) => this.onChange());
            this.watcher.onDidCreate((e) => this.onChange());
            this.watcher.onDidDelete((e) => this.onChange());
        }
    }
    provideCompletionItems(document, position, token, context) {
        var out = [];
        var func = _helpers__WEBPACK_IMPORTED_MODULE_1__.default.parseDocumentFunction(document, position);
        if (func === null) {
            return out;
        }
        if (func && ((func.class && _helpers__WEBPACK_IMPORTED_MODULE_1__.default.tags.config.classes.some((cls) => func.class.includes(cls))) || _helpers__WEBPACK_IMPORTED_MODULE_1__.default.tags.config.functions.some((fn) => func.function.includes(fn)))) {
            for (var i in this.configs) {
                var completeItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(this.configs[i].name, vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Value);
                completeItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_1__.default.wordMatchRegex);
                if (this.configs[i].value) {
                    completeItem.detail = this.configs[i].value.toString();
                }
                out.push(completeItem);
            }
        }
        return out;
    }
    onChange() {
        var self = this;
        if (self.timer !== null) {
            clearTimeout(self.timer);
        }
        self.timer = setTimeout(function () {
            self.loadConfigs();
            self.timer = null;
        }, 5000);
    }
    loadConfigs() {
        try {
            var self = this;
            _helpers__WEBPACK_IMPORTED_MODULE_1__.default.runLaravel("echo json_encode(config()->all());")
                .then(function (result) {
                var configs = JSON.parse(result);
                self.configs = self.getConfigs(configs);
            });
        }
        catch (exception) {
            console.error(exception);
        }
    }
    getConfigs(conf) {
        var out = [];
        for (var i in conf) {
            if (conf[i] instanceof Array) {
                out.push({ name: i, value: 'array(...)' });
            }
            else if (conf[i] instanceof Object) {
                out.push({ name: i, value: 'array(...)' });
                out = out.concat(this.getConfigs(conf[i]).map(function (c) {
                    c.name = i + "." + c.name;
                    return c;
                }));
            }
            else {
                out.push({ name: i, value: conf[i] });
            }
        }
        return out;
    }
}


/***/ }),

/***/ "./src/EloquentProvider.ts":
/*!*********************************!*\
  !*** ./src/EloquentProvider.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EloquentProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");



class EloquentProvider {
    constructor() {
        this.timer = null;
        this.models = {};
        this.watchers = [];
        var self = this;
        if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders !== undefined) {
            for (let modelsPath of vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("LaravelExtraIntellisense").get('modelsPaths', ['app', 'app/Models']).concat(['database/migrations'])) {
                let watcher = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.createFileSystemWatcher(new vscode__WEBPACK_IMPORTED_MODULE_0__.RelativePattern(vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders[0], modelsPath + '/*.php'));
                watcher.onDidChange((e) => self.onChange());
                watcher.onDidCreate((e) => self.onChange());
                watcher.onDidDelete((e) => self.onChange());
                this.watchers.push(watcher);
            }
        }
        self.loadModels();
    }
    provideCompletionItems(document, position, token, context) {
        var out = [];
        var func = _helpers__WEBPACK_IMPORTED_MODULE_1__.default.parseDocumentFunction(document, position);
        let sourceCode = document.getText();
        let sourceBeforeCursor = sourceCode.substr(0, document.offsetAt(position));
        var isFactory = sourceBeforeCursor.includes("extends Factory") || sourceBeforeCursor.includes("$factory->define(");
        var match = null;
        var objectName = "";
        var modelName = "";
        var modelClass = "";
        if (func != null || isFactory) {
            if (func) {
                let modelNameRegex = /([A-z0-9_\\]+)::[^:;]+$/g;
                var namespaceRegex = /namespace\s+(.+);/g;
                var namespace = "";
                while ((match = modelNameRegex.exec(sourceBeforeCursor)) !== null) {
                    modelName = match[1];
                }
                if (modelName.length === 0) {
                    let variableNameRegex = /(\$([A-z0-9_\\]+))->[^;]+$/g;
                    while ((match = variableNameRegex.exec(sourceBeforeCursor)) !== null) {
                        objectName = match[2];
                    }
                    if (objectName.length > 0) {
                        modelNameRegex = new RegExp("\\$" + objectName + "\\s*=\\s*([A-z0-9_\\\\]+)::[^:]", "g");
                        while ((match = modelNameRegex.exec(sourceBeforeCursor)) !== null) {
                            modelName = match[1];
                        }
                    }
                }
                if ((match = namespaceRegex.exec(sourceBeforeCursor)) !== null) {
                    namespace = match[1];
                }
                modelClass = this.getModelClass(modelName, sourceBeforeCursor);
            }
            else {
                var factoryModelClassRegex = /(protected \$model = ([A-Za-z0-9_\\]+)::class;)|(\$factory->define\(\s*([A-Za-z0-9_\\]+)::class)/g;
                if ((match = factoryModelClassRegex.exec(sourceBeforeCursor)) !== null) {
                    if (typeof match[4] !== 'undefined') { // Laravel 7 <
                        modelName = match[4];
                    }
                    else { // Laravel >= 8
                        modelName = match[2];
                    }
                }
                modelClass = this.getModelClass(modelName, sourceBeforeCursor);
            }
            if (typeof this.models[modelClass] !== 'undefined') {
                if (func && _helpers__WEBPACK_IMPORTED_MODULE_1__.default.relationMethods.some((fn) => func.function.includes(fn))) {
                    out = out.concat(this.getCompletionItems(document, position, this.models[modelClass].relations));
                }
                else {
                    out = out.concat(this.getCompletionItems(document, position, this.models[modelClass].attributes));
                }
            }
        }
        else {
            let isArrayObject = false;
            let objectRegex = /(\$?([A-z0-9_\[\]]+)|(Auth::user\(\)))\-\>[A-z0-9_]*$/g;
            while ((match = objectRegex.exec(sourceBeforeCursor)) !== null) {
                objectName = typeof match[2] !== 'undefined' ? match[2] : match[3];
            }
            if (objectName.match(/\$?[A-z0-9_]+\[.+\].*$/g)) {
                isArrayObject = true;
                objectName = objectName.replace(/\[.+\].*$/g, '');
            }
            if (objectName.length > 0 && objectName != 'Auth::user()') {
                let modelNameRegex = new RegExp("\\$" + objectName + "\\s*=\\s*([A-z0-9_\\\\]+)::[^:;]", "g");
                while ((match = modelNameRegex.exec(sourceBeforeCursor)) !== null) {
                    modelName = match[1];
                }
                modelClass = this.getModelClass(modelName, sourceBeforeCursor);
            }
            if (modelClass == 'Auth' || objectName == 'Auth::user()') {
                if (typeof this.models['App\\User'] !== 'undefined') {
                    out = out.concat(this.getModelAttributesCompletionItems(document, position, 'App\\User'));
                }
                else if (typeof this.models['App\\Models\\User'] !== 'undefined') {
                    out = out.concat(this.getModelAttributesCompletionItems(document, position, 'App\\Models\\User'));
                }
            }
            let customVariables = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("LaravelExtraIntellisense").get('modelVariables', {});
            for (let customVariable in customVariables) {
                if (customVariable === objectName && typeof this.models[customVariables[customVariable]] !== 'undefined') {
                    out = out.concat(this.getModelAttributesCompletionItems(document, position, customVariables[customVariable]));
                }
            }
            for (let i in this.models) {
                if (i == modelClass ||
                    (this.models[i].camelCase == objectName || this.models[i].snakeCase == objectName) ||
                    (isArrayObject == true && (this.models[i].pluralCamelCase == objectName || this.models[i].pluralSnakeCase == objectName))) {
                    out = out.concat(this.getModelAttributesCompletionItems(document, position, i));
                }
            }
        }
        out = out.filter((v, i, a) => a.map((ai) => ai.label).indexOf(v.label) === i); // Remove duplicate items
        return out;
    }
    getModelClass(modelName, sourceBeforeCursor) {
        let match = null;
        let modelClass = "";
        if (modelName.length === 0) {
            return "";
        }
        var modelClassRegex = new RegExp("use (.+)" + modelName + ";", "g");
        if (modelName.substr(0, 1) === '\\') {
            modelClass = modelName.substr(1);
        }
        else if ((match = modelClassRegex.exec(sourceBeforeCursor)) !== null) {
            modelClass = match[1] + modelName;
        }
        else {
            modelClass = modelName;
        }
        return modelClass;
    }
    getModelAttributesCompletionItems(document, position, modelClass) {
        let out = [];
        if (typeof this.models[modelClass] !== 'undefined') {
            out = out.concat(this.getCompletionItems(document, position, this.models[modelClass].attributes.map((attr) => attr[vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("LaravelExtraIntellisense").get('modelAttributeCase', 'default')])));
            out = out.concat(this.getCompletionItems(document, position, this.models[modelClass].accessors.map((attr) => attr[vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("LaravelExtraIntellisense").get('modelAccessorCase', 'snake')]), vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Constant));
            out = out.concat(this.getCompletionItems(document, position, this.models[modelClass].relations, vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Value));
        }
        return out;
    }
    getCompletionItems(document, position, items, type = vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Property) {
        let out = [];
        for (let item of items) {
            var completeItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(item, type);
            completeItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_1__.default.wordMatchRegex);
            out.push(completeItem);
        }
        return out;
    }
    onChange() {
        var self = this;
        if (self.timer !== null) {
            clearTimeout(self.timer);
        }
        self.timer = setTimeout(function () {
            self.loadModels();
            self.timer = null;
        }, 5000);
    }
    loadModels() {
        var self = this;
        try {
            _helpers__WEBPACK_IMPORTED_MODULE_1__.default.runLaravel("foreach (['" + vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("LaravelExtraIntellisense").get('modelsPaths', ['app', 'app/Models']).join('\', \'') + "'] as $modelPath) {" +
                "   if (is_dir(base_path($modelPath))) {" +
                "      foreach (scandir(base_path($modelPath)) as $sourceFile) {" +
                "         if (substr($sourceFile, -4) == '.php' && is_file(base_path(\"$modelPath/$sourceFile\"))) {" +
                "             include_once base_path(\"$modelPath/$sourceFile\");" +
                "         }" +
                "      }" +
                "   }" +
                "}" +
                "$modelClasses = array_values(array_filter(get_declared_classes(), function ($declaredClass) {" +
                "   return is_subclass_of($declaredClass, 'Illuminate\\Database\\Eloquent\\Model') && $declaredClass != 'Illuminate\\Database\\Eloquent\\Relations\\Pivot' && $declaredClass != 'Illuminate\\Foundation\\Auth\\User';" +
                "}));" +
                "$output = [];" +
                "foreach ($modelClasses as $modelClass) {" +
                "   $classReflection = new \\ReflectionClass($modelClass);" +
                "   $output[$modelClass] = [" +
                "       'name' => $classReflection->getShortName()," +
                "       'camelCase' => Illuminate\\Support\\Str::camel($classReflection->getShortName())," +
                "       'snakeCase' => Illuminate\\Support\\Str::snake($classReflection->getShortName())," +
                "       'pluralCamelCase' => Illuminate\\Support\\Str::camel(Illuminate\\Support\\Str::plural($classReflection->getShortName()))," +
                "       'pluralSnakeCase' => Illuminate\\Support\\Str::snake(Illuminate\\Support\\Str::plural($classReflection->getShortName()))," +
                "       'attributes' => []," +
                "       'accessors' => []," +
                "       'relations' => []" +
                "   ];" +
                "   try {" +
                "       $modelInstance = $modelClass::first();" +
                "       $attributes = array_values(array_unique(array_merge(app($modelClass)->getFillable(), array_keys($modelInstance ? $modelInstance->getAttributes() : []))));" +
                "       $output[$modelClass]['attributes'] = array_map(function ($attribute) {" +
                "           return ['default' => $attribute, 'snake' => Illuminate\\Support\\Str::snake($attribute), 'camel' => Illuminate\\Support\\Str::camel($attribute)];" +
                "       }, $attributes);" +
                "   } catch (\\Throwable $e) {}" +
                "   foreach ($classReflection->getMethods() as $classMethod) {" +
                "       try {" +
                "           if (" +
                "                $classMethod->isStatic() == false &&" +
                "                $classMethod->isPublic() == true &&" +
                "                substr($classMethod->getName(), 0, 3) != 'get' &&" +
                "                substr($classMethod->getName(), 0, 3) != 'set' &&" +
                "                count($classMethod->getParameters()) == 0 &&" +
                "                preg_match('/belongsTo|hasMany|hasOne|morphOne|morphMany|morphTo/', implode('', array_slice(file($classMethod->getFileName()), $classMethod->getStartLine(), $classMethod->getEndLine() - $classMethod->getStartLine() - 1)))" +
                "           ) {" +
                "               $output[$modelClass]['relations'][] = $classMethod->getName();" +
                "           } elseif (" +
                "                substr($classMethod->getName(), 0, 3) == 'get' && " +
                "                substr($classMethod->getName(), -9) == 'Attribute' &&" +
                "                !empty(substr($classMethod->getName(), 3, -9))" +
                "           ) {" +
                "               $attributeName = substr($classMethod->getName(), 3, -9);" +
                "               $output[$modelClass]['accessors'][] = ['default' => $attributeName, 'snake' => Illuminate\\Support\\Str::snake($attributeName), 'camel' => Illuminate\\Support\\Str::camel($attributeName)];" +
                "           }" +
                "       } catch (\\Throwable $e) {}" +
                "   }" +
                "   sort($output[$modelClass]['attributes']);" +
                "   sort($output[$modelClass]['relations']);" +
                "}" +
                "echo json_encode($output);").then(function (result) {
                let models = JSON.parse(result);
                self.models = models;
            }).catch(function (e) {
                console.error(e);
            });
        }
        catch (exception) {
            console.error(exception);
        }
    }
}


/***/ }),

/***/ "./src/EnvProvider.ts":
/*!****************************!*\
  !*** ./src/EnvProvider.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EnvProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");




class EnvProvider {
    constructor() {
        this.enviroments = {};
        this.timer = null;
        this.watcher = null;
        this.loadEnv();
        if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders !== undefined) {
            this.watcher = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.createFileSystemWatcher(new vscode__WEBPACK_IMPORTED_MODULE_0__.RelativePattern(vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders[0], ".env"));
            this.watcher.onDidChange((e) => this.onChange());
            this.watcher.onDidCreate((e) => this.onChange());
            this.watcher.onDidDelete((e) => this.onChange());
        }
    }
    provideCompletionItems(document, position, token, context) {
        var out = [];
        var func = _helpers__WEBPACK_IMPORTED_MODULE_2__.default.parseDocumentFunction(document, position);
        if (func === null) {
            return out;
        }
        if (func && (_helpers__WEBPACK_IMPORTED_MODULE_2__.default.tags.env.functions.some((fn) => func.function.includes(fn)))) {
            for (var i in this.enviroments) {
                var completeItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(i, vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Constant);
                completeItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_2__.default.wordMatchRegex);
                completeItem.detail = this.enviroments[i];
                out.push(completeItem);
            }
        }
        return out;
    }
    onChange() {
        var self = this;
        if (self.timer !== null) {
            clearTimeout(self.timer);
        }
        self.timer = setTimeout(function () {
            self.loadEnv();
            self.timer = null;
        }, 5000);
    }
    loadEnv() {
        try {
            if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(_helpers__WEBPACK_IMPORTED_MODULE_2__.default.projectPath(".env"))) {
                let enviroments = {};
                let envs = fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync(_helpers__WEBPACK_IMPORTED_MODULE_2__.default.projectPath('.env'), 'utf8').split("\n");
                for (let i in envs) {
                    let envKeyValue = envs[i].split('=');
                    if (envKeyValue.length == 2) {
                        enviroments[envKeyValue[0]] = envKeyValue[1];
                    }
                }
                this.enviroments = enviroments;
            }
        }
        catch (exception) {
            console.error(exception);
        }
    }
}


/***/ }),

/***/ "./src/MiddlewareProvider.ts":
/*!***********************************!*\
  !*** ./src/MiddlewareProvider.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ MiddlewareProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");



class MiddlewareProvider {
    constructor() {
        this.timer = null;
        this.middlewares = [];
        this.watcher = null;
        var self = this;
        self.loadMiddlewares();
        if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders !== undefined) {
            this.watcher = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.createFileSystemWatcher(new vscode__WEBPACK_IMPORTED_MODULE_0__.RelativePattern(vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders[0], "app/Http/Kernel.php"));
            this.watcher.onDidChange((e) => this.onChange());
        }
    }
    provideCompletionItems(document, position, token, context) {
        var out = [];
        var func = _helpers__WEBPACK_IMPORTED_MODULE_1__.default.parseDocumentFunction(document, position);
        if (func === null) {
            return out;
        }
        if (func.function.includes("middleware")) {
            for (let i in this.middlewares) {
                var compeleteItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(i, vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Enum);
                compeleteItem.detail = this.middlewares[i];
                compeleteItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_1__.default.wordMatchRegex);
                out.push(compeleteItem);
            }
        }
        return out;
    }
    onChange() {
        var self = this;
        if (self.timer !== null) {
            clearTimeout(self.timer);
        }
        self.timer = setTimeout(function () {
            self.loadMiddlewares();
            self.timer = null;
        }, 5000);
    }
    loadMiddlewares() {
        if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders instanceof Array && vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders.length > 0) {
            try {
                var self = this;
                // array_map(function ($rh) {return $rh->getName();}, array_filter((new ReflectionMethod('App\Http\Middleware\Authenticate', 'handle'))->getParameters(), function ($rc) {return $rc->getName() != 'request' && $rc->getName() != 'next';}))
                _helpers__WEBPACK_IMPORTED_MODULE_1__.default.runLaravel("$middlewares = array_merge(app('Illuminate\\Contracts\\Http\\Kernel')->getMiddlewareGroups(), app('Illuminate\\Contracts\\Http\\Kernel')->getRouteMiddleware());foreach($middlewares as $key => &$value) {if (is_array($value)){$value = null;}else{$parameters = array_filter((new ReflectionMethod($value, 'handle'))->getParameters(), function ($rc) {return $rc->getName() != 'request' && $rc->getName() != 'next';});$value=implode(',', array_map(function ($rh) {return $rh->getName().($rh->isVariadic()?'...':'');}, $parameters));if(empty($value)){$value=null;}};}echo json_encode($middlewares);")
                    .then(function (result) {
                    let middlewares = JSON.parse(result);
                    self.middlewares = middlewares;
                });
            }
            catch (exception) {
                console.error(exception);
            }
        }
    }
}


/***/ }),

/***/ "./src/MixProvider.ts":
/*!****************************!*\
  !*** ./src/MixProvider.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ MixProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");




class MixProvider {
    constructor() {
        this.mixes = [];
        this.loadMix();
        setInterval(() => this.loadMix(), 60000);
    }
    provideCompletionItems(document, position, token, context) {
        var out = [];
        var func = _helpers__WEBPACK_IMPORTED_MODULE_2__.default.parseDocumentFunction(document, position);
        if (func === null) {
            return out;
        }
        if (func && (_helpers__WEBPACK_IMPORTED_MODULE_2__.default.tags.mix.functions.some((fn) => func.function.includes(fn)))) {
            for (var i in this.mixes) {
                var completeItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(this.mixes[i], vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Value);
                completeItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_2__.default.wordMatchRegex);
                out.push(completeItem);
            }
        }
        return out;
    }
    loadMix() {
        try {
            if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(_helpers__WEBPACK_IMPORTED_MODULE_2__.default.projectPath("public/mix-manifest.json"))) {
                var mixes = JSON.parse(fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync(_helpers__WEBPACK_IMPORTED_MODULE_2__.default.projectPath('public/mix-manifest.json'), 'utf8'));
                this.mixes = Object.keys(mixes).map((mixFile) => mixFile.replace(/^\//g, ''));
            }
        }
        catch (exception) {
            console.error(exception);
        }
    }
}


/***/ }),

/***/ "./src/RouteProvider.ts":
/*!******************************!*\
  !*** ./src/RouteProvider.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ RouteProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");




class RouteProvider {
    constructor() {
        this.timer = null;
        this.routes = [];
        this.controllers = [];
        this.watcher = null;
        var self = this;
        self.loadRoutes();
        self.loadControllers();
        if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders !== undefined) {
            this.watcher = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.createFileSystemWatcher(new vscode__WEBPACK_IMPORTED_MODULE_0__.RelativePattern(vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders[0], "{,**/}{Controllers,[Rr]oute}{,s}{.php,/*.php,/**/*.php}"));
            this.watcher.onDidChange((e) => this.onChange());
            this.watcher.onDidCreate((e) => this.onChange());
            this.watcher.onDidDelete((e) => this.onChange());
        }
    }
    provideCompletionItems(document, position, token, context) {
        var out = [];
        var func = _helpers__WEBPACK_IMPORTED_MODULE_2__.default.parseDocumentFunction(document, position);
        if (func === null) {
            return out;
        }
        if (func && ((func.class && _helpers__WEBPACK_IMPORTED_MODULE_2__.default.tags.route.classes.some((cls) => func.class.includes(cls))) || _helpers__WEBPACK_IMPORTED_MODULE_2__.default.tags.route.functions.some((fn) => func.function.includes(fn)))) {
            if (func.class === 'Route' && ['get', 'post', 'put', 'patch', 'delete', 'options', 'any', 'match'].some((fc) => func.function.includes(fc))) {
                if ((func.function === 'match' && func.paramIndex === 2) || (func.function !== 'match' && func.paramIndex === 1)) {
                    // Route action autocomplete.
                    for (let i in this.controllers) {
                        if (typeof this.controllers[i] === "string" && this.controllers[i].length > 0) {
                            var compeleteItem2 = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(this.controllers[i], vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Enum);
                            compeleteItem2.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_2__.default.wordMatchRegex);
                            out.push(compeleteItem2);
                        }
                    }
                }
            }
            else if (func.function.includes('middleware') === false) {
                if (func.paramIndex === 1) {
                    // route parameters autocomplete
                    for (let i in this.routes) {
                        if (this.routes[i].name === func.parameters[0]) {
                            for (var j in this.routes[i].parameters) {
                                var compeleteItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(this.routes[i].parameters[j], vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Variable);
                                compeleteItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_2__.default.wordMatchRegex);
                                out.push(compeleteItem);
                            }
                            return out;
                        }
                    }
                }
                // Route name autocomplete
                for (let i in this.routes) {
                    if (typeof this.routes[i].name === "string" && this.routes[i].name.length > 0) {
                        var compeleteItem3 = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(this.routes[i].name, vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Enum);
                        compeleteItem3.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_2__.default.wordMatchRegex);
                        compeleteItem3.detail = this.routes[i].action +
                            "\n\n" +
                            this.routes[i].method +
                            ":" +
                            this.routes[i].uri;
                        out.push(compeleteItem3);
                    }
                }
            }
        }
        return out;
    }
    onChange() {
        var self = this;
        if (self.timer !== null) {
            clearTimeout(self.timer);
        }
        self.timer = setTimeout(function () {
            self.loadRoutes();
            self.loadControllers();
            self.timer = null;
        }, 5000);
    }
    loadRoutes() {
        if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders instanceof Array && vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders.length > 0) {
            try {
                var self = this;
                _helpers__WEBPACK_IMPORTED_MODULE_2__.default.runLaravel("echo json_encode(array_map(function ($route) {return ['method' => implode('|', array_filter($route->methods(), function ($method) {return $method != 'HEAD';})), 'uri' => $route->uri(), 'name' => $route->getName(), 'action' => str_replace('App\\\\Http\\\\Controllers\\\\', '', $route->getActionName()), 'parameters' => $route->parameterNames()];}, app('router')->getRoutes()->getRoutes()));")
                    .then(function (result) {
                    var routes = JSON.parse(result);
                    routes = routes.filter((route) => route !== 'null');
                    self.routes = routes;
                });
            }
            catch (exception) {
                console.error(exception);
            }
        }
    }
    loadControllers() {
        try {
            this.controllers = this.getControllers(_helpers__WEBPACK_IMPORTED_MODULE_2__.default.projectPath("app/Http/Controllers")).map((contoller) => contoller.replace(/@__invoke/, ''));
            this.controllers = this.controllers.filter((v, i, a) => a.indexOf(v) === i);
        }
        catch (exception) {
            console.error(exception);
        }
    }
    getControllers(path) {
        var self = this;
        var controllers = [];
        if (path.substr(-1) !== '/' && path.substr(-1) !== '\\') {
            path += "/";
        }
        if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(path) && fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(path).isDirectory()) {
            fs__WEBPACK_IMPORTED_MODULE_1__.readdirSync(path).forEach(function (file) {
                if (fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(path + file).isDirectory()) {
                    controllers = controllers.concat(self.getControllers(path + file + "/"));
                }
                else {
                    if (file.includes(".php")) {
                        var controllerContent = fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync(path + file, 'utf8');
                        if (controllerContent.length < 50000) {
                            var match = ((/class\s+([A-Za-z0-9_]+)\s+extends\s+.+/g).exec(controllerContent));
                            var matchNamespace = ((/namespace .+\\Http\\Controllers\\?([A-Za-z0-9_]*)/g).exec(controllerContent));
                            var functionRegex = /public\s+function\s+([A-Za-z0-9_]+)\(.*\)/g;
                            if (match !== null && matchNamespace) {
                                var className = match[1];
                                var namespace = matchNamespace[1];
                                while ((match = functionRegex.exec(controllerContent)) !== null && match[1] !== '__construct') {
                                    if (namespace.length > 0) {
                                        controllers.push(namespace + '\\' + className + '@' + match[1]);
                                    }
                                    controllers.push(className + '@' + match[1]);
                                }
                            }
                        }
                    }
                }
            });
        }
        return controllers;
    }
}


/***/ }),

/***/ "./src/TranslationProvider.ts":
/*!************************************!*\
  !*** ./src/TranslationProvider.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TranslationProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");




class TranslationProvider {
    constructor() {
        this.timer = null;
        this.translations = [];
        this.watcher = null;
        var self = this;
        self.loadTranslations();
        if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders !== undefined) {
            this.watcher = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.createFileSystemWatcher(new vscode__WEBPACK_IMPORTED_MODULE_0__.RelativePattern(vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders[0], "{,**/}{lang,localization,localizations,trans,translation,translations}/{*,**/*}"));
            this.watcher.onDidChange((e) => this.onChange());
            this.watcher.onDidCreate((e) => this.onChange());
            this.watcher.onDidDelete((e) => this.onChange());
        }
    }
    provideCompletionItems(document, position, token, context) {
        var out = [];
        var func = _helpers__WEBPACK_IMPORTED_MODULE_2__.default.parseDocumentFunction(document, position);
        if (func === null) {
            return out;
        }
        if (func && ((func.class && _helpers__WEBPACK_IMPORTED_MODULE_2__.default.tags.trans.classes.some((cls) => func.class.includes(cls))) || _helpers__WEBPACK_IMPORTED_MODULE_2__.default.tags.trans.functions.some((fn) => func.function.includes(fn)))) {
            if (func.paramIndex === 1) {
                // parameters autocomplete
                var paramRegex = /\:([A-Za-z0-9_]+)/g;
                var match = null;
                for (let i in this.translations) {
                    if (this.translations[i].name === func.parameters[0]) {
                        while ((match = paramRegex.exec(this.translations[i].value)) !== null) {
                            var compeleteItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(match[1], vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Variable);
                            compeleteItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_2__.default.wordMatchRegex);
                            out.push(compeleteItem);
                        }
                        return out;
                    }
                }
                return out;
            }
            for (let i in this.translations) {
                var completeItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(this.translations[i].name, vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Value);
                completeItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_2__.default.wordMatchRegex);
                if (this.translations[i].value) {
                    completeItem.detail = this.translations[i].value.toString();
                }
                out.push(completeItem);
            }
        }
        return out;
    }
    onChange() {
        var self = this;
        if (self.timer) {
            clearTimeout(self.timer);
        }
        self.timer = setTimeout(function () {
            self.loadTranslations();
            self.timer = null;
        }, 5000);
    }
    loadTranslations() {
        var translations = [];
        try {
            var self = this;
            _helpers__WEBPACK_IMPORTED_MODULE_2__.default.runLaravel("echo json_encode(app('translator')->getLoader()->namespaces());")
                .then(async function (result) {
                var tranlationNamespaces = JSON.parse(result);
                for (let i in tranlationNamespaces) {
                    tranlationNamespaces[i + '::'] = tranlationNamespaces[i];
                    delete tranlationNamespaces[i];
                }
                let langPath = JSON.parse(await _helpers__WEBPACK_IMPORTED_MODULE_2__.default.runLaravel('echo json_encode(app()->langPath());'));
                tranlationNamespaces[''] = langPath;
                var nestedTranslationGroups = function (basePath, relativePath = '') {
                    let path = basePath + '/' + relativePath;
                    let out = [];
                    if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(path) && fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(path).isDirectory()) {
                        fs__WEBPACK_IMPORTED_MODULE_1__.readdirSync(path).forEach(function (file) {
                            if (fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(path + '/' + file).isFile()) {
                                out.push(relativePath + '/' + file.replace(/\.php/, ''));
                            }
                            else if (fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(path + '/' + file).isDirectory()) {
                                let nestedOut = nestedTranslationGroups(basePath, (relativePath.length > 0 ? relativePath + '/' : '') + file);
                                for (let nested of nestedOut) {
                                    out.push(nested);
                                }
                            }
                        });
                    }
                    return out;
                };
                var translationGroups = [];
                fs__WEBPACK_IMPORTED_MODULE_1__.readdirSync(langPath).forEach(function (langDir) {
                    var path = langPath + '/' + langDir;
                    if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(path) && fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(path).isDirectory()) {
                        fs__WEBPACK_IMPORTED_MODULE_1__.readdirSync(path).forEach(function (subDirectory) {
                            let subDirectoryPath = path + '/' + subDirectory;
                            if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(subDirectoryPath) && fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(subDirectoryPath).isDirectory()) {
                                let nestedDirectories = nestedTranslationGroups(path, subDirectory);
                                for (let nestedDirectory of nestedDirectories) {
                                    translationGroups.push(nestedDirectory);
                                }
                            }
                        });
                    }
                });
                for (let i in tranlationNamespaces) {
                    if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(tranlationNamespaces[i]) && fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(tranlationNamespaces[i]).isDirectory()) {
                        fs__WEBPACK_IMPORTED_MODULE_1__.readdirSync(tranlationNamespaces[i]).forEach(function (langDir) {
                            var path = tranlationNamespaces[i] + '/' + langDir;
                            if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(path) && fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(path).isDirectory()) {
                                fs__WEBPACK_IMPORTED_MODULE_1__.readdirSync(path).forEach(function (file) {
                                    if (fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(path + '/' + file).isFile()) {
                                        translationGroups.push(i + file.replace(/\.php/, ''));
                                    }
                                });
                            }
                        });
                    }
                }
                translationGroups = translationGroups.filter(function (item, index, array) { return array.indexOf(item) === index; });
                _helpers__WEBPACK_IMPORTED_MODULE_2__.default.runLaravel("echo json_encode([" + translationGroups.map((transGroup) => "'" + transGroup + "' => __('" + transGroup + "')").join(",") + "]);")
                    .then(function (translationGroupsResult) {
                    translationGroups = JSON.parse(translationGroupsResult);
                    for (var i in translationGroups) {
                        translations = translations.concat(self.getTranslations(translationGroups[i], i));
                    }
                    self.translations = translations;
                    _helpers__WEBPACK_IMPORTED_MODULE_2__.default.runLaravel("echo json_encode(__('*'));")
                        .then(function (jsontransResult) {
                        translations = translations.concat(self.getTranslations(JSON.parse(jsontransResult), '').map(function (transInfo) {
                            transInfo.name = transInfo.name.replace(/^\./, '');
                            return transInfo;
                        }));
                        self.translations = translations;
                    });
                });
            });
        }
        catch (exception) {
            console.error(exception);
        }
    }
    getTranslations(translations, prefix) {
        var out = [];
        for (var i in translations) {
            if (translations[i] instanceof Object) {
                out.push({ name: prefix + '.' + i, value: "array(...)" });
                out = out.concat(this.getTranslations(translations[i], prefix + '.' + i));
            }
            else {
                out.push({ name: prefix + '.' + i, value: translations[i] });
            }
        }
        return out;
    }
}


/***/ }),

/***/ "./src/ValidationProvider.ts":
/*!***********************************!*\
  !*** ./src/ValidationProvider.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ValidationProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");



class ValidationProvider {
    constructor() {
        this.rules = {
            'accepted': 'accepted',
            'active_url': 'active_url',
            'after': 'after:date',
            'after_or_equal': 'after_or_equal:${0:date}',
            'alpha': 'alpha',
            'alpha_dash': 'alpha_dash',
            'alpha_num': 'alpha_num',
            'array': 'array',
            'bail': 'bail',
            'before': 'before:${1:date}',
            'before_or_equal': 'before_or_equal:${1:date}',
            'between': 'between:${1:min},${2:max}',
            'boolean': 'boolean',
            'confirmed': 'confirmed',
            'date': 'date',
            'date_equals': 'date_equals:${1:date}',
            'date_format': 'date_format:${1:format}',
            'different': 'different:${1:field}',
            'digits': 'digits:${1:value}',
            'digits_between': 'digits_between:${1:min},${2:max}',
            'dimensions': 'dimensions',
            'distinct': 'distinct',
            'email': 'email',
            'ends_with': 'ends_with:${1}',
            'exists': 'exists:${2:table},${3:column}',
            'file': 'file',
            'filled': 'filled',
            'gt': 'gt:${1:field}',
            'gte': 'gte:${1:field}',
            'image': 'image',
            'in': 'in:${1:something},${2:something else}',
            'in_array': 'in_array:${1:anotherfield.*}',
            'integer': 'integer',
            'ip': 'ip',
            'ipv4': 'ipv4',
            'ipv6': 'ipv6',
            'json': 'json',
            'lt': 'lt:${1:field}',
            'lte': 'lte:${1:field}',
            'max': 'max:${1:value}',
            'mimetypes': 'mimetypes:${1:text/plain}',
            'mimes': 'mimes:${1:png,jpg}',
            'min': 'min:${1:value}',
            'not_in': 'not_in:${1:something},${2:something else}',
            'not_regex': 'not_regex:${1:pattern}',
            'nullable': 'nullable',
            'numeric': 'numeric',
            'present': 'present',
            'regex': 'regex:${1:pattern}',
            'required': 'required',
            'required_if': 'required_if:${1:anotherfield},${2:value}',
            'required_unless': 'required_unless:${1:anotherfield},${2:value}',
            'required_with': 'required_with:${1:anotherfield}',
            'required_with_all': 'required_with_all:${1:anotherfield},${2:anotherfield}',
            'required_without': 'required_without:${1:anotherfield}',
            'required_without_all': 'required_without_all:${1:anotherfield},${2:anotherfield}',
            'same': 'same:${1:field}',
            'size': 'size:${1:value}',
            'sometimes': 'sometimes',
            'starts_with': 'starts_with:${1:foo},${2:bar}',
            'string': 'string',
            'timezone': 'timezone',
            'unique': 'unique:${1:table},${2:column},${3:except},${4:id}',
            'url': 'url',
            'uuid': 'uuid',
        };
    }
    provideCompletionItems(document, position, token, context) {
        var out = [];
        var func = _helpers__WEBPACK_IMPORTED_MODULE_1__.default.parseDocumentFunction(document, position);
        if ((func && func.paramIndex !== null && func.function && _helpers__WEBPACK_IMPORTED_MODULE_1__.default.tags.validation.functions.some((fn) => func.function.includes(fn))) ||
            (func && func.paramIndex !== null && func.class && _helpers__WEBPACK_IMPORTED_MODULE_1__.default.tags.validation.classes.some((cls) => func.class.includes(cls))) ||
            (document.getText().match(/class .* extends FormRequest/g) && document.getText().match(/use Illuminate\\Foundation\\Http\\FormRequest;/g))) {
            var rules = this.rules;
            Object.assign(rules, vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("LaravelExtraIntellisense.customValidationRules"));
            for (var i in rules) {
                var completeItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(i, vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Enum);
                completeItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_1__.default.wordMatchRegex);
                completeItem.insertText = new vscode__WEBPACK_IMPORTED_MODULE_0__.SnippetString(this.rules[i]);
                out.push(completeItem);
            }
        }
        return out;
    }
}


/***/ }),

/***/ "./src/ViewProvider.ts":
/*!*****************************!*\
  !*** ./src/ViewProvider.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ViewProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");




class ViewProvider {
    constructor() {
        this.timer = null;
        this.views = {};
        this.watcher = null;
        var self = this;
        self.loadViews();
        if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders !== undefined) {
            this.watcher = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.createFileSystemWatcher(new vscode__WEBPACK_IMPORTED_MODULE_0__.RelativePattern(vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders[0], "{,**/}{view,views}/{*,**/*}"));
            this.watcher.onDidCreate((e) => this.onChange());
            this.watcher.onDidDelete((e) => this.onChange());
        }
    }
    provideCompletionItems(document, position, token, context) {
        var out = [];
        var func = _helpers__WEBPACK_IMPORTED_MODULE_2__.default.parseDocumentFunction(document, position);
        if (func === null) {
            return out;
        }
        if (func && ((func.class && _helpers__WEBPACK_IMPORTED_MODULE_2__.default.tags.view.classes.some((cls) => func.class.includes(cls))) || _helpers__WEBPACK_IMPORTED_MODULE_2__.default.tags.view.functions.some((fn) => func.function.includes(fn)))) {
            if (func.paramIndex === 0) {
                for (let i in this.views) {
                    var compeleteItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(i, vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Constant);
                    compeleteItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_2__.default.wordMatchRegex);
                    out.push(compeleteItem);
                }
            }
            else if (typeof this.views[func.parameters[0]] !== 'undefined') {
                var viewContent = fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync(this.views[func.parameters[0]], 'utf8');
                var variableRegex = /\$([A-Za-z_][A-Za-z0-9_]*)/g;
                var r = [];
                var variableNames = [];
                while (r = variableRegex.exec(viewContent)) {
                    variableNames.push(r[1]);
                }
                variableNames = variableNames.filter((v, i, a) => a.indexOf(v) === i);
                for (let i in variableNames) {
                    var variableCompeleteItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(variableNames[i], vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Constant);
                    variableCompeleteItem.range = document.getWordRangeAtPosition(position, _helpers__WEBPACK_IMPORTED_MODULE_2__.default.wordMatchRegex);
                    out.push(variableCompeleteItem);
                }
            }
        }
        else if (func && (func.function === '@section' || func.function === '@push')) {
            out = this.getYields(func.function, document.getText());
        }
        return out;
    }
    getYields(func, documentText) {
        var out = [];
        var extendsRegex = /@extends\s*\([\'\"](.+)[\'\"]\)/g;
        var regexResult = [];
        if (regexResult = extendsRegex.exec(documentText)) {
            if (typeof this.views[regexResult[1]] !== 'undefined') {
                var parentContent = fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync(this.views[regexResult[1]], 'utf8');
                var yieldRegex = /@yield\s*\([\'\"]([A-Za-z0-9_\-\.]+)[\'\"](,.*)?\)/g;
                if (func === '@push') {
                    yieldRegex = /@stack\s*\([\'\"]([A-Za-z0-9_\-\.]+)[\'\"](,.*)?\)/g;
                }
                var yeildNames = [];
                while (regexResult = yieldRegex.exec(parentContent)) {
                    yeildNames.push(regexResult[1]);
                }
                yeildNames = yeildNames.filter((v, i, a) => a.indexOf(v) === i);
                for (var i in yeildNames) {
                    var yieldCompeleteItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItem(yeildNames[i], vscode__WEBPACK_IMPORTED_MODULE_0__.CompletionItemKind.Constant);
                    out.push(yieldCompeleteItem);
                }
                out = out.concat(this.getYields(func, parentContent));
            }
        }
        return out;
    }
    onChange() {
        var self = this;
        if (self.timer) {
            clearTimeout(self.timer);
        }
        self.timer = setTimeout(function () {
            self.loadViews();
            self.timer = null;
        }, 5000);
    }
    loadViews() {
        try {
            var self = this;
            var code = "echo json_encode(app('view')->getFinder()->getHints());";
            _helpers__WEBPACK_IMPORTED_MODULE_2__.default.runLaravel(code.replace("getHints", "getPaths"))
                .then(function (viewPathsResult) {
                var viewPaths = JSON.parse(viewPathsResult);
                _helpers__WEBPACK_IMPORTED_MODULE_2__.default.runLaravel(code)
                    .then(function (viewNamespacesResult) {
                    var viewNamespaces = JSON.parse(viewNamespacesResult);
                    for (let i in viewPaths) {
                        viewPaths[i] = viewPaths[i].replace(_helpers__WEBPACK_IMPORTED_MODULE_2__.default.projectPath('/', true), _helpers__WEBPACK_IMPORTED_MODULE_2__.default.projectPath('/'));
                    }
                    for (let i in viewNamespaces) {
                        for (let j in viewNamespaces[i]) {
                            viewNamespaces[i][j] = viewNamespaces[i][j].replace(_helpers__WEBPACK_IMPORTED_MODULE_2__.default.projectPath('/', true), _helpers__WEBPACK_IMPORTED_MODULE_2__.default.projectPath('/'));
                        }
                    }
                    let views = {};
                    for (let i in viewPaths) {
                        views = Object.assign(views, self.getViews(viewPaths[i]));
                    }
                    for (let i in viewNamespaces) {
                        for (var j in viewNamespaces[i]) {
                            var viewsInNamespace = self.getViews(viewNamespaces[i][j]);
                            for (var k in viewsInNamespace) {
                                views[i + "::" + k] = viewNamespaces[k];
                            }
                        }
                    }
                    self.views = views;
                });
            });
        }
        catch (exception) {
            console.error(exception);
        }
    }
    getViews(path) {
        if (path.substr(-1) !== '/' && path.substr(-1) !== '\\') {
            path += "/";
        }
        var out = {};
        var self = this;
        if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(path) && fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(path).isDirectory()) {
            fs__WEBPACK_IMPORTED_MODULE_1__.readdirSync(path).forEach(function (file) {
                if (fs__WEBPACK_IMPORTED_MODULE_1__.lstatSync(path + file).isDirectory()) {
                    var viewsInDirectory = self.getViews(path + file + "/");
                    for (var i in viewsInDirectory) {
                        out[file + vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("LaravelExtraIntellisense").get('viewDirectorySeparator') + i] = viewsInDirectory[i];
                    }
                }
                else {
                    if (file.includes("blade.php")) {
                        out[file.replace(".blade.php", "")] = path + file;
                    }
                }
            });
        }
        return out;
    }
}


/***/ }),

/***/ "./src/helpers.ts":
/*!************************!*\
  !*** ./src/helpers.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Helpers)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! child_process */ "child_process");
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(child_process__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var os__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! os */ "os");
/* harmony import */ var os__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(os__WEBPACK_IMPORTED_MODULE_3__);





class Helpers {
    /**
     * Create full path from project file name
     *
     * @param path
     * @param forCode
     * @param string
     */
    static projectPath(path, forCode = false) {
        if (path[0] !== '/') {
            path = '/' + path;
        }
        let basePath = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("LaravelExtraIntellisense").get('basePath');
        if (forCode === false && basePath && basePath.length > 0) {
            basePath = basePath.replace(/[\/\\]$/, "");
            return basePath + path;
        }
        let basePathForCode = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("LaravelExtraIntellisense").get('basePathForCode');
        if (forCode && basePathForCode && basePathForCode.length > 0) {
            basePathForCode = basePathForCode.replace(/[\/\\]$/, "");
            return basePathForCode + path;
        }
        if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders instanceof Array && vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders.length > 0) {
            for (let workspaceFolder of vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders) {
                if (fs__WEBPACK_IMPORTED_MODULE_2__.existsSync(workspaceFolder.uri.fsPath + "/artisan")) {
                    return workspaceFolder.uri.fsPath + path;
                }
            }
        }
        return "";
    }
    static arrayUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    /**
     * Boot laravel and run simple php code.
     *
     * @param code
     */
    static runLaravel(code) {
        code = code.replace(/(?:\r\n|\r|\n)/g, ' ');
        if (fs__WEBPACK_IMPORTED_MODULE_2__.existsSync(Helpers.projectPath("vendor/autoload.php")) && fs__WEBPACK_IMPORTED_MODULE_2__.existsSync(Helpers.projectPath("bootstrap/app.php"))) {
            var command = "define('LARAVEL_START', microtime(true));" +
                "require_once '" + Helpers.projectPath("vendor/autoload.php", true) + "';" +
                "$app = require_once '" + Helpers.projectPath("bootstrap/app.php", true) + "';" +
                "class VscodeLaravelExtraIntellisenseProvider extends \\Illuminate\\Support\\ServiceProvider" +
                "{" +
                "   public function register() {}" +
                "	public function boot()" +
                "	{" +
                "       if (method_exists($this->app['log'], 'setHandlers')) {" +
                "			$this->app['log']->setHandlers([new \\Monolog\\Handler\\NullHandler()]);" +
                "		}" +
                "	}" +
                "}" +
                "$app->register(new VscodeLaravelExtraIntellisenseProvider($app));" +
                "$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);" +
                "$status = $kernel->handle(" +
                "$input = new Symfony\\Component\\Console\\Input\\ArgvInput," +
                "new Symfony\\Component\\Console\\Output\\ConsoleOutput" +
                ");" +
                "echo '___VSCODE_LARAVEL_EXTRA_INSTELLISENSE_OUTPUT___';" +
                code +
                "echo '___VSCODE_LARAVEL_EXTRA_INSTELLISENSE_END_OUTPUT___';";
            var self = this;
            return new Promise(function (resolve, error) {
                self.runPhp(command)
                    .then(function (result) {
                    var out = result;
                    out = /___VSCODE_LARAVEL_EXTRA_INSTELLISENSE_OUTPUT___(.*)___VSCODE_LARAVEL_EXTRA_INSTELLISENSE_END_OUTPUT___/g.exec(out);
                    if (out) {
                        resolve(out[1]);
                    }
                    else {
                        error("PARSE ERROR: " + result);
                    }
                })
                    .catch(function (e) {
                    error(e);
                });
            });
        }
        return new Promise((resolve, error) => resolve(""));
    }
    /**
     * run simple php code.
     *
     * @param code
     */
    static async runPhp(code) {
        var _a;
        code = code.replace(/\"/g, "\\\"");
        if (['linux', 'openbsd', 'sunos', 'darwin'].some(unixPlatforms => os__WEBPACK_IMPORTED_MODULE_3__.platform().includes(unixPlatforms))) {
            code = code.replace(/\$/g, "\\$");
            code = code.replace(/\\\\'/g, '\\\\\\\\\'');
            code = code.replace(/\\\\"/g, '\\\\\\\\\"');
        }
        let command = (_a = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("LaravelExtraIntellisense").get('phpCommand')) !== null && _a !== void 0 ? _a : "php -r \"{code}\"";
        command = command.replace("{code}", code);
        let out = new Promise(function (resolve, error) {
            child_process__WEBPACK_IMPORTED_MODULE_1__.exec(command, function (err, stdout, stderr) {
                if (stdout.length > 0) {
                    resolve(stdout);
                }
                else {
                    error(stderr);
                }
            });
        });
        return out;
    }
    /**
     * Parse php code with 'php-parser' package.
     * @param code
     */
    static parsePhp(code) {
        if (!Helpers.phpParser) {
            var PhpEngine = __webpack_require__(/*! php-parser */ "./node_modules/php-parser/src/index.js");
            Helpers.phpParser = new PhpEngine({
                parser: {
                    extractDoc: true,
                    php7: true
                },
                ast: {
                    withPositions: true
                }
            });
        }
        try {
            return Helpers.phpParser.parseCode(code);
        }
        catch (exception) {
            return null;
        }
    }
    /**
     * Convert php variable defination to javascript variable.
     * @param code
     */
    static evalPhp(code) {
        var out = Helpers.parsePhp('<?php ' + code + ';');
        if (out && typeof out.children[0] !== 'undefined') {
            return out.children[0].expression.value;
        }
        return undefined;
    }
    /**
     * Parse php function call.
     *
     * @param text
     * @param position
     */
    static parseFunction(text, position, level = 0) {
        var out = null;
        var classes = [];
        for (let i in Helpers.tags) {
            for (let j in Helpers.tags[i].classes) {
                classes.push(Helpers.tags[i].classes[j]);
            }
        }
        var regexPattern = "(((" + classes.join('|') + ")::)?([@A-Za-z0-9_]+))((\\()((?:[^)(]|\\((?:[^)(]|\\([^)(]*\\))*\\))*)(\\)|$))";
        var functionRegex = new RegExp(regexPattern, "g");
        var paramsRegex = /((\s*\,\s*)?)(\[[\s\S]*(\]|$)|array\[\s\S]*(\)|$)|(\"((\\\")|[^\"])*(\"|$))|(\'((\\\')|[^\'])*(\'|$)))/g;
        var inlineFunctionMatch = /\((([\s\S]*\,)?\s*function\s*\(.*\)\s*\{)([\S\s]*)\}/g;
        text = text.substr(Math.max(0, position - 200), 400);
        position -= Math.max(0, position - 200);
        var match = null;
        var match2 = null;
        if (Helpers.cachedParseFunction !== null && Helpers.cachedParseFunction.text === text && position === Helpers.cachedParseFunction.position) {
            out = Helpers.cachedParseFunction.out;
        }
        else if (level < 6) {
            while ((match = functionRegex.exec(text)) !== null) {
                if (position >= match.index && position < match.index + match[0].length) {
                    if ((match2 = inlineFunctionMatch.exec(match[0])) !== null) {
                        out = this.parseFunction(match2[3], position - (match.index + match[1].length + match[6].length + match2[1].length), level + 1);
                    }
                    else {
                        var textParameters = [];
                        var paramIndex = null;
                        var paramIndexCounter = 0;
                        var paramsPosition = position - (match.index + match[1].length + match[6].length);
                        var functionInsideParameter;
                        if (match[7].length >= 4 && (functionInsideParameter = this.parseFunction(match[7], paramsPosition))) {
                            return functionInsideParameter;
                        }
                        while ((match2 = paramsRegex.exec(match[7])) !== null) {
                            textParameters.push(match2[3]);
                            if (paramsPosition >= match2.index && paramsPosition <= match2.index + match2[0].length) {
                                paramIndex = paramIndexCounter;
                            }
                            paramIndexCounter++;
                        }
                        var functionParametrs = [];
                        for (let i in textParameters) {
                            functionParametrs.push(this.evalPhp(textParameters[i]));
                        }
                        out = {
                            class: match[3],
                            function: match[4],
                            paramIndex: paramIndex,
                            parameters: functionParametrs,
                            textParameters: textParameters
                        };
                    }
                    if (level === 0) {
                        Helpers.cachedParseFunction = { text, position, out };
                    }
                }
            }
        }
        return out;
    }
    /**
     * Parse php function call from vscode editor.
     *
     * @param document
     * @param position
     */
    static parseDocumentFunction(document, position) {
        var pos = document.offsetAt(position);
        return Helpers.parseFunction(document.getText(), pos);
    }
    /**
     * Get laravel models as array.
     *
     * @returns array<string>
     */
    static getModels() {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (Math.floor(Date.now() / 1000) - self.modelsCacheTime < 60) {
                return resolve(self.modelsCache);
            }
            else {
                Helpers.runLaravel(`
					echo json_encode(array_values(array_filter(array_map(function ($name) {return app()->getNamespace().str_replace([app_path().'/', app_path().'\\\\', '.php', '/'], ['', '', '', '\\\\'], $name);}, array_merge(glob(app_path('*')), glob(app_path('Models/*')))), function ($class) {
						return class_exists($class) && is_subclass_of($class, 'Illuminate\\\\Database\\\\Eloquent\\\\Model');
					})));
				`).then(function (result) {
                    var models = JSON.parse(result);
                    self.modelsCache = models;
                    resolve(models);
                })
                    .catch(function (error) {
                    console.error(error);
                    resolve([]);
                });
            }
        });
    }
    /**
     * Get indent space based on user configuration
     */
    static getSpacer() {
        const editor = vscode__WEBPACK_IMPORTED_MODULE_0__.window.activeTextEditor;
        if (editor && editor.options.insertSpaces) {
            return ' '.repeat(editor.options.tabSize);
        }
        return '\t';
    }
}
Helpers.wordMatchRegex = /[\w\d\-_\.\:\\\/@]+/g;
Helpers.phpParser = null;
Helpers.cachedParseFunction = null;
Helpers.modelsCacheTime = 0;
Helpers.tags = {
    config: { classes: ['Config'], functions: ['config'] },
    mix: { classes: [], functions: ['mix'] },
    route: { classes: ['Route'], functions: ['route'] },
    trans: { classes: ['Lang'], functions: ['__', 'trans', '@lang'] },
    validation: { classes: ['Validator'], functions: ['validate', 'sometimes', 'rules'] },
    view: { classes: ['View'], functions: ['view', 'markdown', 'links', '@extends', '@component', '@include', '@each'] },
    env: { classes: [], functions: ['env'] },
    auth: { classes: ['Gate'], functions: ['can', '@can', '@cannot', '@canany'] },
    asset: { classes: [], functions: ['asset'] },
    model: { classes: [], functions: [] },
};
Helpers.functionRegex = null;
Helpers.relationMethods = ['has', 'orHas', 'whereHas', 'orWhereHas', 'whereDoesntHave', 'orWhereDoesntHave',
    'doesntHave', 'orDoesntHave', 'hasMorph', 'orHasMorph', 'doesntHaveMorph', 'orDoesntHaveMorph',
    'whereHasMorph', 'orWhereHasMorph', 'whereDoesntHaveMorph', 'orWhereDoesntHaveMorph',
    'withAggregate', 'withCount', 'withMax', 'withMin', 'withSum', 'withAvg'];


/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");;

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");;

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");;

/***/ }),

/***/ "vscode":
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("vscode");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**************************!*\
  !*** ./src/extension.ts ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "activate": () => (/* binding */ activate),
/* harmony export */   "deactivate": () => (/* binding */ deactivate)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");
/* harmony import */ var _RouteProvider__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./RouteProvider */ "./src/RouteProvider.ts");
/* harmony import */ var _ViewProvider__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ViewProvider */ "./src/ViewProvider.ts");
/* harmony import */ var _ConfigProvider__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ConfigProvider */ "./src/ConfigProvider.ts");
/* harmony import */ var _TranslationProvider__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./TranslationProvider */ "./src/TranslationProvider.ts");
/* harmony import */ var _MixProvider__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./MixProvider */ "./src/MixProvider.ts");
/* harmony import */ var _ValidationProvider__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ValidationProvider */ "./src/ValidationProvider.ts");
/* harmony import */ var _EnvProvider__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./EnvProvider */ "./src/EnvProvider.ts");
/* harmony import */ var _MiddlewareProvider__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./MiddlewareProvider */ "./src/MiddlewareProvider.ts");
/* harmony import */ var _AuthProvider__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./AuthProvider */ "./src/AuthProvider.ts");
/* harmony import */ var _AssetProvider__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./AssetProvider */ "./src/AssetProvider.ts");
/* harmony import */ var _EloquentProvider__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./EloquentProvider */ "./src/EloquentProvider.ts");
/* harmony import */ var _BladeProvider__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./BladeProvider */ "./src/BladeProvider.ts");
















function activate(context) {
    showWelcomeMessage(context);
    if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders instanceof Array && vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders.length > 0) {
        if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(_helpers__WEBPACK_IMPORTED_MODULE_2__.default.projectPath("artisan"))) {
            const LANGUAGES = [
                { scheme: 'file', language: 'php' },
                { scheme: 'file', language: 'blade' },
                { scheme: 'file', language: 'laravel-blade' }
            ];
            const TRIGGER_CHARACTERS = "\"'".split("");
            context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.languages.registerCompletionItemProvider(LANGUAGES, new _RouteProvider__WEBPACK_IMPORTED_MODULE_3__.default, ...TRIGGER_CHARACTERS));
            context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.languages.registerCompletionItemProvider(LANGUAGES, new _ViewProvider__WEBPACK_IMPORTED_MODULE_4__.default, ...TRIGGER_CHARACTERS));
            context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.languages.registerCompletionItemProvider(LANGUAGES, new _ConfigProvider__WEBPACK_IMPORTED_MODULE_5__.default, ...TRIGGER_CHARACTERS));
            context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.languages.registerCompletionItemProvider(LANGUAGES, new _TranslationProvider__WEBPACK_IMPORTED_MODULE_6__.default, ...TRIGGER_CHARACTERS));
            context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.languages.registerCompletionItemProvider(LANGUAGES, new _MixProvider__WEBPACK_IMPORTED_MODULE_7__.default, ...TRIGGER_CHARACTERS));
            context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.languages.registerCompletionItemProvider(LANGUAGES, new _ValidationProvider__WEBPACK_IMPORTED_MODULE_8__.default, ...TRIGGER_CHARACTERS.concat(['|'])));
            context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.languages.registerCompletionItemProvider(LANGUAGES, new _EnvProvider__WEBPACK_IMPORTED_MODULE_9__.default, ...TRIGGER_CHARACTERS));
            context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.languages.registerCompletionItemProvider(LANGUAGES, new _MiddlewareProvider__WEBPACK_IMPORTED_MODULE_10__.default, ...TRIGGER_CHARACTERS));
            context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.languages.registerCompletionItemProvider(LANGUAGES, new _AuthProvider__WEBPACK_IMPORTED_MODULE_11__.default, ...TRIGGER_CHARACTERS));
            context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.languages.registerCompletionItemProvider(LANGUAGES, new _AssetProvider__WEBPACK_IMPORTED_MODULE_12__.default, ...TRIGGER_CHARACTERS));
            context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.languages.registerCompletionItemProvider(LANGUAGES, new _EloquentProvider__WEBPACK_IMPORTED_MODULE_13__.default, ...TRIGGER_CHARACTERS.concat(['>'])));
            context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.languages.registerCompletionItemProvider(LANGUAGES, new _BladeProvider__WEBPACK_IMPORTED_MODULE_14__.default, '@'));
        }
    }
}
function deactivate() { }
function showWelcomeMessage(context) {
    var _a, _b;
    let previousVersion = context.globalState.get('laravel-extra-intellisense-version');
    let currentVersion = (_b = (_a = vscode__WEBPACK_IMPORTED_MODULE_0__.extensions.getExtension('amiralizadeh9480.laravel-extra-intellisense')) === null || _a === void 0 ? void 0 : _a.packageJSON) === null || _b === void 0 ? void 0 : _b.version;
    let message = null;
    let previousVersionArray = previousVersion ? previousVersion.split('.').map((s) => Number(s)) : [0, 0, 0];
    let currentVersionArray = currentVersion.split('.').map((s) => Number(s));
    if (previousVersion === undefined || previousVersion.length === 0) {
        message = "Thanks for using Laravel Extra Intellisense.";
    }
    else if (currentVersion !== previousVersion && (
    // (previousVersionArray[0] === currentVersionArray[0] && previousVersionArray[1] === currentVersionArray[1] && previousVersionArray[2] < currentVersionArray[2]) ||
    (previousVersionArray[0] === currentVersionArray[0] && previousVersionArray[1] < currentVersionArray[1]) ||
        (previousVersionArray[0] < currentVersionArray[0]))) {
        message = "Laravel Extra Intellisense updated to " + currentVersion + " - New feature: Add blade directives autocomplete.";
    }
    if (message) {
        vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage(message, '⭐️ Star on Github', '🐞 Report Bug')
            .then(function (val) {
            if (val === '⭐️ Rate') {
                vscode__WEBPACK_IMPORTED_MODULE_0__.env.openExternal(vscode__WEBPACK_IMPORTED_MODULE_0__.Uri.parse('https://marketplace.visualstudio.com/items?itemName=amiralizadeh9480.laravel-extra-intellisense'));
            }
            else if (val === '🐞 Report Bug') {
                vscode__WEBPACK_IMPORTED_MODULE_0__.env.openExternal(vscode__WEBPACK_IMPORTED_MODULE_0__.Uri.parse('https://github.com/amir9480/vscode-laravel-extra-intellisense/issues'));
            }
            else if (val === '⭐️ Star on Github') {
                vscode__WEBPACK_IMPORTED_MODULE_0__.env.openExternal(vscode__WEBPACK_IMPORTED_MODULE_0__.Uri.parse('https://github.com/amir9480/vscode-laravel-extra-intellisense'));
            }
        });
        context.globalState.update('laravel-extra-intellisense-version', currentVersion);
    }
}

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map