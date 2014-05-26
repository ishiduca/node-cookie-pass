.PHONEY: tdd test

tdd:
	tap xt/*.js

test:
	tap t/*.js
