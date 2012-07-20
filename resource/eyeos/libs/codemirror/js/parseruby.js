


var RubyParser = Editor.Parser = (function() {

  function buildProgress(word) {
    var progress = {}, current;
      for (var i in word) {
        current = progress;
        for (var ch in word[i]) {
          if(!current[word[i][ch]]) current[word[i][ch]] = {};
          current = current[word[i][ch]];
        }
      }
    return progress;
  }


    function wordRegexp(words) {
        return new RegExp("^(?:" + words.join("|") + ")$");
    }
    var NORMALCONTEXT = 'rb-normal';
    var ERRORCLASS = 'rb-error';
    var COMMENTCLASS = 'rb-comment';
    var SYMBOLCLASS = 'rb-symbol';
    var CONSTCLASS = 'rb-constant';
    var OPCLASS = 'rb-operator';
    var INSTANCEMETHODCALLCLASS = 'rb-method'
    var VARIABLECLASS = 'rb-variable';
    var STRINGCLASS = 'rb-string';
    var FIXNUMCLASS =  'rb-fixnum rb-numeric';
    var METHODCALLCLASS = 'rb-method-call';
    var HEREDOCCLASS = 'rb-heredoc';
    var ERRORCLASS = 'rb-parse-error';
    var BLOCKCOMMENT = 'rb-block-comment';
    var FLOATCLASS = 'rb-float';
    var HEXNUMCLASS = 'rb-hexnum';
    var BINARYCLASS = 'rb-binary';
    var ASCIICODE = 'rb-ascii'
    var LONGCOMMENTCLASS = 'rb-long-comment';
    var WHITESPACEINLONGCOMMENTCLASS = 'rb-long-comment-whitespace';
    var KEWORDCLASS = 'rb-keyword';
    var REGEXPCLASS = 'rb-regexp';
    var GLOBALVARCLASS = 'rb-global-variable';
    var EXECCLASS = 'rb-exec';
    var INTRANGECLASS = 'rb-range';
    var OPCLASS = 'rb-operator';
    
    
    var identifierStarters = /[_A-Za-z]/;    
    var stringStarters = /['"]/;
    var numberStarters = /[0-9]/;
    var keywords = wordRegexp(['begin', 'class', 'ensure', 'nil', 'self', 'when', 'end', 'def', 'false', 'not', 'super', 'while', 'alias', 'defined', 'for', 'or', 'then', 'yield', 'and', 'do', 'if', 'redo', 'true', 'begin', 'else', 'in', 'rescue', 'undef', 'break', 'elsif', 'module', 'retry', 'unless', 'case', 'end', 'next', 'return', 'until']);
    
    var changeOperators = ['=', '%=', '/=', '-=', '+=', '|=', '&=', '>>=', '<<=', '*=', '&&=', '||=', '**='];
    var boolOperators = ['>=', '<=', '==', '===', '=~', '!=', '<>', '!', '?', ':'];
    var mathOperators = ['/', '*', '+', '-']
    var structureOperators = ['=>'];
    var operators = changeOperators.
                      concat(boolOperators).
                      concat(mathOperators).
                      concat(structureOperators);
    
    var operatorProgress = buildProgress(operators);
    
    var py, keywords, types, stringStarters, stringTypes, config;



    function configure(conf) { config = conf; }
    
    var wasDef = false;
    
    var tokenizeRuby = (function() {

        /* state nesting */
        var stateStack = [normal];
        function pushState(state, setState) {
          stateStack.push(state);
          setState(state);
        }

        function popState(setState) {
          stateStack.pop();
          setState(topState());
        }

        function topState() {
          return stateStack[stateStack.length-1];
        }        

        function ancestorState(level) {
          level = level ? level : '1'
          return stateStack[stateStack.length-1-level];
        }        


        /* special states */
        
        function inHereDoc(style, keyword) {
          return function(source, setState) {
              var st = '';
              while (!source.endOfLine()) {
                var ch = source.next();
                if (ch == keyword[keyword.length-1]) {
                  st += source.get();
                  if (st.substr(st.length - keyword.length, keyword.length) == keyword) {
                    setState(normal);
                    return {content:st, style:style};
                  }
                }
              }
              return style;
            }          
        }

        function inRubyInsertableString(style, ending_char) {
          return inString(style, ending_char, true);
        }

        function inStaticString(style, ending_char) {
          return inString(style, ending_char, false);
        }        

        function inString(style, ending_char, ruby_insertable) {
          return function(source, setState) {
              var stringDelim, threeStr, temp, type, word, possible = {};
              while (!source.endOfLine()) {
                  var ch = source.next();
                  // Skip escaped characters
                  if (ch == '\\') {
                    ch = source.next();
                    ch = source.next();
                  }
                  if (ch == ending_char) {
                   popState(setState);
                   break;
                  }
                  if (ch == '#' && source.peek() == '{') {
                   source.next();
                   if (ruby_insertable) {
                     pushState(inRubyInsertableStringNormal(style), setState);
                   } else {
                     pushState(inIgnoredBracesString(style), setState);
                   }
                   return style;
                  }
                }
                return style;
            }          
        }
        
        /* states for #{} in strings */
        
        function inRubyInsertableStringNormal(style) {
          var originalState = ancestorState();
          var waitingForBraces = 1;
          return function(source, setState) {
            if (source.peek() == '}') {
              waitingForBraces -= 1;
            }            
            if (source.peek() == '{') {
              waitingForBraces += 1;
            }            
            if (waitingForBraces == 0) {
              source.next();
              popState(setState);
              return style;
            } else {
              return originalState(source, setState);
            }
          }          
        }            

        function inIgnoredBracesString(style) {
          return function(source, setState) {
            var ch = source.next();
            if (ch == '}') {
              popState(setState);
            }
            return style;
          }          
        }            
        
        
        /* the default ruby code state */
        function normal(source, setState) {
            var stringDelim, threeStr, temp, type, word, possible = {};
            var ch = source.next();
            
            // Handle comments
            if (ch == '#') {
                while (!source.endOfLine()) {
                    source.next();
                }
                return COMMENTCLASS;
            }

            if (ch == ':') {
                type = SYMBOLCLASS;
                source.nextWhile(matcher(/[\w\d]/));
                word = source.get();
                return {content:word, style:type};
            }

            if (ch == '=') {
              var peek = source.peek();
              if (peek == 'b' || peek == 'e') {
                source.nextWhile(matcher(/[\w\d]/));
                word = source.get();
                return {content:word, style:LONGCOMMENTCLASS};
              }
            }

            if (ch == '@') {
                type = 'rb-instance-var';
                if (source.peek() == '@') {
                  source.next()
                  type = 'rb-class-var';
                }
                source.nextWhile(matcher(/[\w\d]/));
                word = source.get();
                return {content:word, style:type};
            }
            
            
            if (numberStarters.test(ch) ||
                  ( ch == '-' && numberStarters.test(source.peek()) )
              ) {
                var type = FIXNUMCLASS;
                source.nextWhile(matcher(/[0-9_]/));
                word = source.get();
                if (source.peek() == 'x') {
                  source.next()
                  source.nextWhile(matcher(/[a-f0-9]/));
                  word += source.get();
                  return {content:word, style:HEXNUMCLASS};
                }
                if (source.peek() == 'b') {
                  source.next()
                  source.nextWhile(matcher(/[01]/));
                  word += source.get();
                  return {content:word, style:BINARYCLASS};
                }
                if (source.peek() == '.') {
                  source.next();
                  if (source.peek() != '.') {
                    type = FLOATCLASS;
                    source.nextWhile(matcher(/[0-9_]/));
                    word += source.get();
                  } else {
                    word += source.get();
                    // two dots are used as a range operator
                    source.push('.');
                    return {content:word.substr(0, word.length-1), style:type};
                  }
                }
                if (source.peek() == 'e') {
                  source.next();
                  if (source.peek() == '-') {
                    source.next();
                  }
                  type = FLOATCLASS;
                  source.nextWhile(matcher(/[0-9_]/));
                  word += source.get();
                }
                return {content:word, style:type};
            }
            

            if (ch == '%') {
                type = STRINGCLASS;
                var peek = source.peek();
                if (peek == 'w') {
                  pushState(inStaticString(STRINGCLASS, '}'), setState);                  
                  return null;
                }
                if (peek == 'W') {
                  pushState(inRubyInsertableString(STRINGCLASS, '}'), setState);
                  return null;
                }                
                
                if (peek == 'q' || peek == 'Q') {
                  source.next();
                  var ending = source.next();
                  if (ending == '(') ending = ')';
                  if (ending == '{') ending = '}';                  
                  pushState(inString(STRINGCLASS, ending, peek == 'Q'), setState);
                  return {content:source.get(), style:STRINGCLASS}; 
                }
                pushState(inRubyInsertableString(STRINGCLASS, source.peek()), setState);
                source.next();
                return {content:source.get(), style:STRINGCLASS}; 
            }
            
            if (ch == '$') {
              if ((/[!@_\.&~n=\/\\0\*$\?]/).test(source.peek())) {
                source.next();
              } else {
                source.nextWhile(matcher(identifierStarters));
              }
              return {content:source.get(), style:GLOBALVARCLASS};
            }

            if (ch == '\'') {
              pushState(inStaticString(STRINGCLASS, '\''), setState); 
              return null;
            }

            if (ch == '`') {
              pushState(inRubyInsertableString(EXECCLASS, '`'), setState); 
              return null;
            }
            
            
            if (ch == '/') {
              pushState(inStaticString(REGEXPCLASS, '/'), setState); 
              return null;
            }
            
            if (ch == '\"') {
                pushState(inRubyInsertableString(STRINGCLASS, "\""), setState);
                return null;
            }


            if (ch == '.') {
              if (source.peek() == '.') {
                source.next();
                return OPCLASS;
              } else {
                source.nextWhile(matcher(/[\w\d]/));
                word = source.get();
                return {content:word, style:METHODCALLCLASS};
              }
            }

            if (ch == '?') {
              var peek = source.peek();
              if (peek == '\\') {
                source.next();
                source.nextWhile(matcher(/[A-Za-z\\-]/));
                return {content:source.get(), style:ASCIICODE};
              } else {
                source.next();
                return {content:source.get(), style:ASCIICODE};
              }
            }
            
            if (ch == '<') {
              if (source.peek() == '<') {
                source.next();
                if (source.peek() == '-' || source.peek() == '`') {
                  source.next();
                }
                if (identifierStarters.test(source.peek())) {
                  source.nextWhile(matcher(/[\w\d]/));
                  var keyword = source.get();
                  setState(inHereDoc(HEREDOCCLASS, keyword.match(/\w+/)[0]));
                  return {content:keyword, style:HEREDOCCLASS};
                }
              }
            }

            if (operatorProgress[ch]) {
              var current = operatorProgress;
              while (current[ch][source.peek()]) {
                current = current[ch];
                ch = source.next();
              }
              return {content:source.get(), style:OPCLASS};
            }                
                
                
            if (identifierStarters.test(ch)) {
                source.nextWhile(matcher(/[A-Za-z_]/));
                if ((/[!\?]/).test(source.peek())) {
                  source.next();
                }
                word = source.get();
                /* for now, all identifiers are considered method calls */
                //type = 'rb-identifier';
                type = INSTANCEMETHODCALLCLASS;
                
                if (keywords.test(word)) {
                  type = KEWORDCLASS;
                }
                if (wasDef) {
                  type = 'rb-method rb-methodname';
                }                

                wasDef = (word == 'def');

                if (ch.toUpperCase() == ch) {
                    type = CONSTCLASS;
                    while (source.peek() == ':') {
                        source.next();
                        if (source.peek() == ':') {
                            source.next();
                            source.nextWhile(matcher(/[\w\d]/));
                        }
                    }
                    word += source.get();
                }

                

                // in development
                if (false && type == INSTANCEMETHODCALLCLASS) {
                  var char = null;
                  pushback = '';
                  while(!source.endOfLine()) {
                    char = source.next();
                    pushback += char;

                    if (char == ',') { 
                      // get another variable
                    }
                    if (char == '=') { 
                      type = VARIABLECLASS;
                      break;
                    }
                  }
                  //console.log('pushback "'+pushback+'"');
                  source.push(pushback);
                }                
                
                return {content:word, style:type};
            }
            return NORMALCONTEXT;
        }

        return function(source, startState) {
            return tokenizer(source, startState || normal);
        };
    })();
    

    function parseRuby(source) {
        var tokens = tokenizeRuby(source);
        var lastToken = null;
        var column = 0;
        var context = {prev: null,
                       endOfScope: false,
                       startNewScope: false,
                       level: 0,
                       next: null,
                       type: NORMALCONTEXT
                       };

        function pushContext(level, type) {
            type = type ? type : NORMALCONTEXT;
            context = {prev: context,
                       endOfScope: false,
                       startNewScope: false,
                       level: level,
                       next: null,
                       type: type
                       };
        }

        function popContext(remove) {
            remove = remove ? remove : false;
            if (context.prev) {
                if (remove) {
                    context = context.prev;
                    context.next = null;
                } else {
                    context.prev.next = context;
                    context = context.prev;
                }
            }
        }
        
        var inLongComment = false;

        var iter = {
            next: function() {
                var token = tokens.next();
                var type = token.style;
                var content = token.content;

                
                /* long comment support */
                if (lastToken && lastToken.content == "\n") {
                  if (token.content == '=begin') {
                    inLongComment = true;
                  }
                  if (token.content == '=end') {
                    inLongComment = false;
                  }
                }                
                if (inLongComment) {
                  if (token.style == 'whitespace') {
                    token.style += ' '+WHITESPACEINLONGCOMMENTCLASS;
                  } else {
                    token.style = LONGCOMMENTCLASS;
                  }
                }
                
                

                lastToken = token;
                return token;
            },

            copy: function() {
                var _context = context, _tokenState = tokens.state;
                return function(source) {
                    tokens = tokenizeRuby(source, _tokenState);
                    context = _context;
                    return iter;
                };
            }
        };
        return iter;
    }

    return {make: parseRuby,
            electricChars: "",
            configure: configure};
})();
