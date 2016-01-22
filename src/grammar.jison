/* lexical grammar */
/* =============== */
%lex
%%
\s+                                  /* skip whitespace */
[-]?[0-9]+("."[0-9]+)?\b             return 'NUMBER';
"var_"[a-z0-9_]+                     return 'VARIABLE';
['][^']+[']                          return 'TEXT';
(minimum|maximum|range)              return 'FUNCTION';
","                                  return ',';
"u"                                  return 'u';
"+"                                  return '+';
"-"                                  return '-';
"*"                                  return '*';
"/"                                  return '/';
"^"                                  return '^';
"%"                                  return '%';
"("                                  return '(';
")"                                  return ')';
"error"                              return 'error';
"friendly"                           return 'friendly';
<<EOF>>                              return 'EOF';
/lex
/* operator associations and precedence in increasing order */
/* ==================================== */
%left 'friendly'
%left '-'
%left '+'
%left '/'
%left '*'
%left 'u'
/* language grammar */
/* ================ */
%start expressions
%% 
expressions
    : e EOF
        {return $1;} ;
e
    : '(' e ')'
        {$$ = {group: [$2]};}
    | e '+' e
        {$$ = {operation: '+', group: [$1, $3]};}
    | e '-' e
        {$$ = {operation: '-', group: [$1, $3]};}
    | e '*' e
        {$$ = {operation: '*', group: [$1, $3]};}
    | e '/' e
        {$$ = {operation: '/', group: [$1, $3]};}
    | FUNCTION '(' e ',' e ')'
        {$$ = {operation: $1, group: [$3, $5]};}
    | NUMBER
        {$$ = {quantity: yytext};}
    | VARIABLE
        {$$ = {variable: yytext.substr(4)};}
    | e 'u' TEXT
        {$$ = $1; $$.units = $3.substr(1,$3.length-2);}
    | 'error'
        {$$ = {error: $1};}
    | e 'friendly' TEXT
        {$$ = $1; $$.friendly = $3.substr(1, $3.length-2);} ;
