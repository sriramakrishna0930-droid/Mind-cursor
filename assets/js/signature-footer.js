/* SignaturePenFooter — vanilla JS port of the React component.
 * A closing sign-off where a white stylus writes one word in flowing script,
 * stroke by stroke, then rests beside it. No dependencies. */

'use strict';

/* #region signature — pure: glyph layout, stroke smoothing, sampling, pen timeline. */

const GLYPHS = {
  "0": [662, "466 583 432 608 343 611 293 589 189 520 132 463 85 387 47 265 41 164 82 63 151 16 230 -6 318 9 422 63 520 161 576 268 608 384 608 479 583 558 532 608 479 649 425 665 350 668"],
  "1": [378, "170 450 261 523 315 589 356 646 384 646 287 428 192 211 154 101 145 38|6 9 69 32 132 32 205 38 284 35"],
  "2": [702, "198 491 195 501 195 536 287 602 372 630 472 643 573 621 621 586 649 510 617 432 539 346 435 265 350 205 261 148 198 113 170 98 123 66 104 47 57 16 57 47 82 82 120 95 186 91 255 66 299 38 403 -3 513 -6 570 19 617 57 630 85"],
  "3": [665, "239 498 255 567 321 617 406 639 479 643 558 624 605 564 608 498 589 460 545 422 510 394 438 378 362 365 312 346 299 356 293 384 369 378 482 356 536 337 567 290 576 208 554 145 495 79 428 32 353 0 220 -19 148 -9 104 19 76 72 85 110 101 132"],
  "4": [558, "243 -6 268 95 321 249 419 463 504 636 372 526 239 422 104 340 38 284 -3 224 50 252 88 268 183 268 261 265 334 249 410 249 491 280 529 306 554 337"],
  "5": [643, "318 608 220 460 164 362 220 397 312 428 387 432 460 416 523 378 548 321 548 255 523 183 457 101 378 50 284 13 192 -3 117 -3 50 9 3 32 -25 79 -35 129 -16 154|280 614 422 624 570 630 652 624"],
  "6": [602, "551 507 554 576 523 624 450 636 337 614 214 520 145 432 88 312 60 186 69 98 120 32 195 6 274 6 334 35 406 91 454 154 479 252 463 324 406 365 337 372 271 359 227 321"],
  "7": [501, "110 507 148 592 208 630 318 636 447 621 523 617 576 611 617 633 435 438 293 261 189 139 126 32 113 25"],
  "8": [592, "384 662 268 611 195 536 202 460 227 406 293 375 359 375 435 350 482 280 479 195 444 145 343 76 255 25 173 16 95 22 38 54 25 132 69 214 170 290 422 428 501 469 554 513 573 589 548 643 491 668 384 662"],
  "9": [605, "369 328 318 293 243 284 164 309 126 359 126 454 170 551 239 611 299 643 403 658 485 630 539 558 551 482 529 369 498 284 435 183 359 110 284 50 227 22 158 9 104 9 47 54 35 88 38 158"],
  "!": [359, "444 665 403 592 295 362 232 214|204 63 182 41"],
  "\"": [302, "95 548 79 403|233 548 211 400"],
  "#": [926, "410 743 167 41|693 737 460 38|95 469 825 472|13 192 753 192"],
  "$": [592, "372 403 447 463 479 532 463 586 419 608 328 608 205 576 126 513 98 457 91 422 98 375 246 198 274 151 249 117 192 101 142 107 88 117 63 129|432 658 403 633 239 359 63 13"],
  "%": [548, "189 649 120 621 66 558 66 479 104 444 164 450 211 495 243 545 246 602 233 633 205 646 271 624 413 630 476 662 410 573 211 280 57 19|306 202 261 132 255 60 296 22 340 22 400 66 432 113 441 202 410 233 353 236 306 202"],
  "&": [828, "602 658 573 646 542 595 526 561 526 520|548 621 510 662 457 690 359 680 280 652 249 567 274 488 321 410 387 340 274 328 164 315 66 239 25 145 57 60 120 3 224 -16 343 -3 450 25 539 72 598 142 636 214 646 280 639 321 621 375|728 491 728 463 696 428 570 350 472 309 384 265 340 192 343 154 372 110"],
  "'": [173, "98 551 79 400"],
  "(": [447, "501 684 293 573 148 444 73 315 25 154 19 19 38 -98 66 -161"],
  ")": [617, "372 684 428 554 425 362 356 158 246 9 139 -76 41 -123 -50 -158"],
  "*": [762, "236 602 243 598 400 261|457 617 186 271|554 438 117 428"],
  "+": [731, "101 243 586 243|435 432 249 16"],
  ",": [211, "104 57 123 22 101 -9 28 -117"],
  "-": [444, "161 236 387 243"],
  ".": [224, "145 63 129 38"],
  "/": [564, "482 655 252 356 126 183 25 22"],
  ":": [246, "195 252 183 230|139 63 126 41"],
  ";": [224, "189 252 173 230|101 60 120 41 117 19 101 -9 32 -101"],
  "<": [450, "391 561 101 277 167 186 208 132 252 60"],
  "=": [646, "189 318 573 328|145 139 189 154 548 151"],
  ">": [472, "252 554 328 438 391 375 293 280 173 164 85 79"],
  "?": [564, "139 561 151 602 173 624 246 665 309 696 413 693 469 652 498 561 466 476 422 413 362 365 315 337 246 280 214 236 202 205|129 57 107 32"],
  "@": [895, "602 517 510 551 381 501 284 428 220 356 186 293 183 236 208 202 249 186 309 202 362 252 450 340 554 463 576 463 529 369 507 299 501 214 529 183 598 189 680 255 750 359 788 447 797 554 759 649 658 712 539 724 406 709 265 646 132 542 54 438 -3 284 6 170 41 98 132 19 258 -16 410 -13 570 28 580 35 715 123 788 202 816 258 822 312 816 378"],
  "A": [1062, "-9 41 9 -16 66 -57 154 -66 274 -25 406 79 529 205 662 359 737 463 813 558 882 636 939 699 958 706 876 570 797 346 753 189 750 98 775 19 819 3 910 54 986 126 1030 180|129 161 132 246 167 302 249 331 324 334 441 312 513 296 652 280 813 261 901 261 929 274 958 293"],
  "B": [860, "95 328 22 369 3 419 25 510 117 583 328 680 548 712 696 709 781 677 819 627 816 561 788 520 737 479 598 435 529 425 469 416 428 410 542 324 633 246 668 158 652 72 605 13 532 -38 438 -44 375 -44 318 -25 290 32 277 82 208 32 161 0 148 25 186 148 324 406 372 510 419 561 479 573 517 570"],
  "C": [690, "296 362 403 372 526 441 617 526 658 608 639 680 564 712 375 662 249 576 110 419 41 280 13 132 60 25 189 -31 346 -16 476 35 595 113 668 189"],
  "D": [1033, "652 554 545 507 472 403 454 334 387 186 350 107 302 9 265 -44 236 -38 205 32 202 113 214 208 233 145 375 35 510 -9 728 25 863 113 976 220 1033 372 1021 532 951 627 828 680 608 706 413 671 261 614 154 548 95 460 85 384 126 321 189 293"],
  "E": [850, "662 580 668 504 589 662 501 718 400 706 324 621 328 526 365 428 406 372 444 321 504 306 507 337 466 350 359 346 180 321 41 217 -3 107 44 9 170 -50 318 -47 498 -22 643 38 756 113 803 180 810 205 806 252"],
  "F": [624, "517 576 435 551 369 479 331 384 277 296 217 170 164 76 158 25 176 0 224 9 252 47 268 66|73 372 25 403 -6 476 44 589 145 652 346 690 513 674 630 658 709 658 791 655 828 677 813 680 740 605 718 554 721 507|230 309 195 287 570 331"],
  "G": [951, "825 639 781 696 731 718 621 718 454 677 328 608 208 517 135 419 88 337 66 246 79 161 126 95 214 44 324 32 472 72 580 142 699 233 753 284 775 312 835 353 854 372 822 362 769 271 677 -41 573 -208 466 -353 365 -406 271 -413 227 -375 227 -302 265 -220 365 -117 495 -31 608 28 731 69 762 76 847 91"],
  "H": [939, "290 539 302 539 400 592 447 652 482 699 444 589|444 589 324 255 211 57 110 -72 6 -126 -50 -126 -123 -94 -129 -72|939 680 854 643 810 567 759 447 712 337 665 211 633 107 643 41 671 9 728 6 794 57 869 132 907 183|41 198 32 293 82 353 236 372 315 359 441 343 614 306 759 290 832 306 850 321"],
  "I": [548, "501 693 410 413 334 224 280 126 220 50 167 28 98 19 9 25 -6 50 22 72 66 41 117 32 447 38|233 450 176 523 202 602 277 665 394 684 523 677 598 674 665 649"],
  "J": [687, "643 715 614 687 567 586 501 400 428 202 328 41 258 -35 145 -94 54 -72 28 9 82 110 214 243 309 302 428 356 529 384 624 403|268 438 217 476 211 567 265 633 397 674 523 684 636 668 684 646"],
  "K": [759, "132 532 255 592 334 699 208 359 154 208 110 132 41 32 -25 -50 -126 -120 -211 -129 -258 -113 -293 -57|756 699 564 583 381 435 236 293 145 180|296 403 350 189 435 41 529 -9 595 3 624 50 611 72 595 98"],
  "L": [617, "230 126 239 126 425 202 589 337 687 510 702 624|709 624 671 702 605 721 498 680 410 567 346 369 249 88 214 -6 176 -69 145 -107 126 -120|123 82 6 50 19 82 135 41 302 -76 435 -151 583 -211 750 -202 819 -151 838 -120 841 -57"],
  "M": [1351, "224 536 302 570 343 605 378 646 406 693 428 699 365 529 287 315 205 148 129 19 63 -41 0 -60 -38 -16 -19 47 95 186 249 356 447 542 570 614 649 633 721 605 756 513 740 315 721 189 687 76 712 82 784 198 961 463 1036 570 1106 621 1156 614 1175 589 1188 539 1150 428 1112 350 1068 255 1046 180 1046 101 1084 22 1181 38 1285 129 1320 183"],
  "N": [932, "-230 -38 -211 -91 -154 -126 -66 -107 38 -35 129 107 214 271 274 432 321 561 350 658 359 328 381 189 447 35 507 -19 573 -35 643 0 731 129 788 274 825 472 832 589 819 646 797 709 844 643 873 605 898 586 926 570|158 513 170 517 258 558 293 595 328 658|158 513 170 517 258 558 293 595 328 658"],
  "O": [850, "38 328 38 334 88 491 186 598 334 680 444 715 551 712 652 696 737 627 778 526 791 454 775 324 728 198 636 79 542 0 447 -44 290 -53 180 0 117 129 129 296 183 400 268 501 353 545 419 576 460 576 504 570"],
  "P": [639, "504 576 441 561 387 526 346 479 331 416 306 362 246 265 198 173 170 98 161 63 154 32 170 0 205 13 243 57|101 359 41 394 22 463 44 545 132 611 230 658 324 687 450 702 624 693 740 649 803 595 810 523 775 441 718 378 639 340 504 296 375 274 299 261 214 271"],
  "Q": [800, "699 715 775 680 816 608 813 463 759 287 646 123 532 35 447 -3 337 -25 211 -3 113 54 54 167 50 353 117 513 214 614 296 668 384 715 479 740 573 724 646 677 684 595 687 469 668 356 598 239 513 151 438 104 384 85 274 47 230 63 236 85 296 79 397 32 498 -38 605 -107 734 -183 898 -214|895 -214 1036 -189 1080 -132 1084 -104 1080 -38"],
  "R": [639, "498 573 419 564 356 501 340 438 293 334 208 198 154 85 142 35 161 3 198 19 220 38 227 44|82 369 28 419 22 495 54 561 161 636 274 671 406 696 558 693 671 680 772 617 813 536 788 447 677 365 554 321 432 284 334 280 202 293 198 315 312 230 381 117 498 -22 627 -117 762 -176 882 -176 945 -139 970 -101 976 -66"],
  "S": [706, "693 580 721 621 721 668 665 709 520 690 350 636 268 558 265 485 362 438 517 391 617 337 658 277 652 224 617 170 523 98 372 35 167 -6 63 9 28 47 19 129 54 202 117 255 189 293 293 324"],
  "T": [554, "57 378 9 425 -3 501 38 592 113 646 198 677 287 690 466 687 639 665 806 662 860 674 825 690 743 580 734 539 728 485 743 463|529 570 450 539 391 476 324 353 239 205 180 66 180 25 198 0 230 22 268 63"],
  "U": [671, "9 476 19 482 104 520 167 570 233 630 249 662 280 662 208 558 104 331 54 220 35 117 57 32 129 9 224 41 343 123 504 277 621 419 702 548 743 646 737 709 696 731 646 712 595 684 548 602 513 498 479 359 444 186 422 47 425 -57 441 -139 463 -180 498 -195 529 -198 558 -183"],
  "V": [737, "54 454 0 529 25 611 73 646 189 668 302 677 391 677 447 655 469 649|331 718 337 586 299 482 258 410 211 290 164 167 142 82 145 -9 186 -38 277 -38 400 32 532 154 677 343 784 507 844 598 895 662 939 696 983 724 1002 724"],
  "W": [1206, "69 444 35 476 9 545 47 614 145 662 265 680 391 677 460 665 488 652|416 709 387 592 328 501 220 353 135 217 91 145 54 66 41 6 47 -38 63 -57 98 -66 148 -60 233 -28 328 28 394 85 495 167 586 268 684 394 712 469 721 529 712 586 677 570 665 507 668 416 662 299 687 176 731 91 788 41 876 3 939 13 986 32 1052 126 1096 224 1118 324 1128 387 1115 517 1084 598 1017 649 945 668 898 662 876 643"],
  "X": [806, "66 457 16 491 3 554 25 621 104 665 195 687 268 696 378 684 441 674 469 665 485 662|419 699 397 561 410 410 432 284 488 148 558 54 621 16 702 50 775 113 816 158|778 696 696 583 570 419 469 287 350 173 243 63 135 -16 32 -88 -101 -132 -192 -120 -246 -101 -268 -60 -271 -41"],
  "Y": [627, "28 482 35 485 120 523 195 583 252 646 277 665 287 668 230 554 142 394 69 230 57 154 50 76 85 16 158 16 233 54 334 145 403 220 463 306 542 416 595 510 621 586 662 649 715 674 759 680 684 633 633 576 583 400 526 205 457 -6 406 -113 346 -211 296 -284 233 -346 148 -400 69 -413 32 -400 3 -350 6 -296 38 -233 107 -151 205 -60 331 9 416 41 570 91 598 91"],
  "Z": [627, "145 554 135 611 180 662 255 693 381 699 501 690 595 674 674 649 734 633 788 649 822 668 835 702 803 709 759 684 721 646 595 539 457 400 362 290 302 224 227 148 164 104 107 63 57 38 19 28 0 54 16 72 63 54 145 22 243 -50 378 -135 513 -205 671 -205 747 -167 781 -98 775 -69 769 -41|239 340 236 321 621 340"],
  "[": [526, "570 652 444 652 318 469 180 236 95 76 69 13 202 13"],
  "\\": [381, "44 652 148 447 214 277 258 161 309 28"],
  "]": [510, "428 655 554 649 479 476 362 277 280 148 186 13 54 19"],
  "^": [791, "186 662 378 765 485 658"],
  "_": [709, "-28 -35 674 -35"],
  "`": [406, "73 523 202 444"],
  "a": [526, "495 183 457 132 406 79 331 32 271 19 243 63 255 142 296 274 277 243 176 145 69 57 -19 19 -63 66 -57 154 35 261 148 331 230 356 312 356 324 343"],
  "b": [416, "-31 183 47 252 132 328 233 406 312 476 394 583 416 674 372 721 284 680 195 564 98 359 38 202 28 72 38 54 50 145 132 243 249 315 334 334 365 296 369 252 328 183 287 120 189 41 135 19 -13 -9"],
  "c": [346, "243 306 239 350 198 365 101 328 -16 208 -47 170 -72 110 -66 66 -47 25 57 16 186 57 268 123 315 183"],
  "d": [381, "328 312 302 356 258 369 151 334 47 265 -38 176 -63 107 -57 50 13 16 79 63 176 148 277 252 387 334 532 457 668 592 693 668 690 709 639 721 561 684 510 633 441 523 387 425 293 217 246 66 233 -44 258 -98 302 -113 340 -101"],
  "e": [346, "66 170 148 211 217 249 252 306 239 350 180 356 63 287 16 252 -35 192 -66 139 -72 88 -50 44 32 9 170 44 214 82 277 135 315 183"],
  "f": [334, "-110 -365 -60 -321 9 -94 104 154 198 369 277 517 328 617 419 696 466 718 523 696 507 598 406 444 290 321 220 261 173 220 117 192 25 183 28 208 208 205 306 217"],
  "g": [469, "306 350 195 353 69 287 -16 205 -57 164 -79 110 -60 57 -19 19 91 69 176 158 265 252 287 274 318 274 164 -85 35 -331 -22 -381 -72 -410 -117 -416 -167 -381 -148 -280 -79 -220 22 -132 85 -88 258 22 369 110 438 183"],
  "h": [561, "-31 183 113 315 343 482 447 605 469 702 394 718 324 662 255 586 180 457 101 309 13 32 110 148 192 252 287 315 328 334 350 312 340 261 290 183 261 76 284 19 350 19 413 63 482 129 529 183"],
  "i": [249, "-31 183 38 236 60 328 -38 85 -19 22 54 6 132 69 183 129 217 183|123 476 95 438"],
  "j": [258, "-31 183 66 287 104 312 113 299 -82 -145 -173 -309 -243 -391 -306 -416 -365 -406 -387 -353 -359 -287 -252 -183 -69 -60 57 32 151 107 227 183|205 482 167 444 186 428"],
  "k": [356, "-31 183 32 252 98 337|73 356 158 356 271 428 381 542 438 627 450 696 406 728 318 696 249 617 183 498 126 394 19 139 -19 13 25 54 113 173 214 284 290 343 340 346|139 249 186 44 258 -85 362 -148 428 -148 457 -120 460 -101 457 -66"],
  "l": [261, "-25 176 91 265 239 428 346 589 394 662 381 709 312 718 243 674 148 532 41 340 -28 198 -50 85 -22 25 44 19 120 54 195 132 230 183"],
  "m": [687, "-31 183 47 255 76 321 -35 28 38 104 167 252 233 309 280 337 302 340 309 312 296 274 208 107 318 195 403 261 491 293 447 230 400 95 413 38 472 19 561 69 655 183"],
  "n": [580, "148 328 41 25 183 186 271 280 334 318 381 337 394 312 331 195 290 101 293 47 328 16 387 25 450 69 513 132 548 183"],
  "o": [391, "195 337 142 365 66 315 -6 233 -41 161 -57 76 13 9 101 41 183 110 230 208 239 246 239 284 220 284|167 158 183 101 214 72 255 76 296 110 359 183"],
  "p": [356, "25 359 -72 57 -176 -192 -227 -350 -255 -369 -91 38 -44 13 85 63 208 135 258 227 268 299 227 346 139 321 73 274 16 198 -25 148 -91 32"],
  "q": [542, "324 334 224 359 88 293 -35 180 -60 120 -54 69 -31 28 35 25 120 76 186 154 315 284 422 416 372 406 255 91 139 -205 129 -350 161 -403 246 -403 280 -356 293 -249 280 -110 246 35 321 28 413 79 476 135 507 183"],
  "r": [369, "-31 183 35 287 154 463 47 391 47 365 60 356 258 353 145 214 82 101 98 22 186 28 296 132 337 183"],
  "s": [302, "-31 183 9 217 35 261 66 328 117 394 249 447 293 454 343 444 350 413 343 381 328 365|54 274 73 233 161 183 198 135 195 88 151 35 79 -6 32 -28 -25 -31 -35 -19 -35 16 -16 35"],
  "t": [290, "-31 183 19 224 54 261 110 337 183 457 217 510 183 517 9 151 -6 66 19 22 98 28 192 110 258 183|54 346 258 356"],
  "u": [495, "47 309 -19 217 -54 123 -57 57 -9 28 79 54 145 139 227 239 293 353 324 343 214 164 205 98 202 54 255 22 321 41 413 120 463 183"],
  "v": [321, "-31 183 57 274 73 312 69 337 35 356 0 356|41 334 28 170 0 85 0 9 126 186 224 299 318 381 403 432 447 419"],
  "w": [554, "69 346 -13 227 -57 120 -63 69 -50 32 -3 19 57 41 120 113 195 227 236 290 265 287 205 176 195 85 224 32 280 16 391 82 501 205 551 312 551 369 529 422 476 435"],
  "x": [488, "-31 183 60 306 126 321 142 277 158 202 180 117 202 41 271 13 340 41 397 101 457 183|400 346 362 343 227 236 110 135 -3 6 -82 -101 -98 -132 -117 -183"],
  "y": [488, "88 312 3 233 -31 186 -47 132 -54 85 -38 47 13 32 69 47 176 151 280 277 334 334 369 331 274 139 183 -98 107 -230 28 -346 -28 -397 -135 -394 -167 -346 -123 -252 -16 -167 123 -66 265 9 406 123 457 183"],
  "z": [551, "35 202 85 277 145 331 214 340 302 315 384 296 447 318 457 340 432 356 397 334 340 280 126 85 60 22 3 9 -13 38 19 66 66 66 117 41 220 -16 315 -19 384 28 469 117 520 183"],
  "{": [488, "432 668 299 643 233 545 227 444 189 384 132 369 63 362 126 328 154 274 123 208 76 158 35 72 73 -3 113 -19 158 -28"],
  "|": [296, "132 684 126 -28"],
  "}": [558, "372 674 447 665 482 627 472 567 432 510 397 444 369 384 419 362 482 356 375 315 324 274 302 227 293 145 255 76 161 -19 120 -28 28 -31"],
  "~": [491, "161 463 195 498 246 498 321 472 384 447 406 469 422 482"],
};

const ASCENT = 800;
const SPACE = 378;
const JOIN = 16;

const r1 = (v) => Math.round(v * 10) / 10;

const smoothCubics = (pts) => {
  if (pts.length < 2) return [];
  const cusp = (i) => {
    if (i <= 0 || i >= pts.length - 1) return true;
    const ax = pts[i][0] - pts[i - 1][0], ay = pts[i][1] - pts[i - 1][1];
    const bx = pts[i + 1][0] - pts[i][0], by = pts[i + 1][1] - pts[i][1];
    const m = Math.hypot(ax, ay) * Math.hypot(bx, by);
    return m === 0 || (ax * bx + ay * by) / m < -0.2;
  };
  const out = [];
  const k = 1 / 6;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i], p2 = pts[i + 1];
    const ci = cusp(i), cj = cusp(i + 1);
    const p0 = ci ? p1 : pts[i - 1];
    const p3 = cj ? p2 : pts[i + 2];
    const c1 = ci ? p1 : [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2 = cj ? p2 : [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    out.push([p1, c1, c2, p2]);
  }
  return out;
};

const bez = (c, t) => {
  const u = 1 - t, a = u * u * u, b = 3 * u * u * t, d = 3 * u * t * t, e = t * t * t;
  return [a * c[0][0] + b * c[1][0] + d * c[2][0] + e * c[3][0],
          a * c[0][1] + b * c[1][1] + d * c[2][1] + e * c[3][1]];
};

const buildStroke = (pts) => {
  const cubics = smoothCubics(pts);
  let d = "M" + r1(pts[0][0]) + " " + r1(pts[0][1]);
  const s = [pts[0][0], pts[0][1]];
  const acc = [0];
  let len = 0;
  for (const c of cubics) {
    d += "C" + [c[1], c[2], c[3]].map((p) => r1(p[0]) + " " + r1(p[1])).join(" ");
    const chord = Math.hypot(c[3][0] - c[0][0], c[3][1] - c[0][1]);
    const n = Math.max(2, Math.ceil(chord / 8));
    for (let j = 1; j <= n; j++) {
      const p = bez(c, j / n);
      len += Math.hypot(p[0] - s[s.length - 2], p[1] - s[s.length - 1]);
      s.push(p[0], p[1]);
      acc.push(len);
    }
  }
  return { d, pts: s, acc, len };
};

const parseGlyph = (ch) => {
  if (ch === " ") return { adv: SPACE, strokes: [] };
  const g = GLYPHS[ch];
  if (!g) return null;
  const strokes = g[1].split("|").map((part) => {
    const n = part.trim().split(/\s+/).map(Number);
    const out = [];
    for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i], ASCENT - n[i + 1]]);
    return out;
  }).filter((p) => p.length > 1);
  return { adv: g[0], strokes };
};

const plen = (p) => {
  let l = 0;
  for (let i = 1; i < p.length; i++) l += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
  return l;
};

const layoutWord = (text) => {
  const clean = String(text == null ? "" : text).normalize("NFD").replace(/[̀-ͯ]/g, "");
  const runs = [];
  const late = [];
  let x = 0, prevEnd = null;
  for (const ch of clean) {
    const g = parseGlyph(ch) || parseGlyph(" ");
    g.strokes.forEach((raw, si) => {
      const p = raw.map(([a, b]) => [a + x, b]);
      const last = runs[runs.length - 1];
      const touches = prevEnd && Math.hypot(p[0][0] - prevEnd[0], p[0][1] - prevEnd[1]) < JOIN;
      if (touches && last) { last.push(...p.slice(1)); prevEnd = p[p.length - 1]; return; }
      const cy = p.reduce((s, q) => s + q[1], 0) / p.length;
      if (si > 0 && plen(p) < 260 && cy < ASCENT - 260) { late.push(p); return; }
      runs.push(p);
      prevEnd = p[p.length - 1];
    });
    if (!g.strokes.length) prevEnd = null;
    x += g.adv;
  }
  const all = [...runs, ...late];
  if (!all.length) return { strokes: [], box: { x: 0, y: 0, w: 0, h: 0 } };
  const strokes = all.map(buildStroke);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const k of strokes)
    for (let i = 0; i < k.pts.length; i += 2) {
      x0 = Math.min(x0, k.pts[i]); y0 = Math.min(y0, k.pts[i + 1]);
      x1 = Math.max(x1, k.pts[i]); y1 = Math.max(y1, k.pts[i + 1]);
    }
  return { strokes, box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } };
};

const pointAt = (s, l) => {
  const { acc, pts } = s;
  if (l <= 0) return [pts[0], pts[1]];
  if (l >= s.len) return [pts[pts.length - 2], pts[pts.length - 1]];
  let lo = 0, hi = acc.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (acc[mid] < l) lo = mid; else hi = mid;
  }
  const t = (l - acc[lo]) / (acc[hi] - acc[lo] || 1);
  return [pts[lo * 2] + (pts[hi * 2] - pts[lo * 2]) * t, pts[lo * 2 + 1] + (pts[hi * 2 + 1] - pts[lo * 2 + 1]) * t];
};

const endsOf = (s) => [[s.pts[0], s.pts[1]], [s.pts[s.pts.length - 2], s.pts[s.pts.length - 1]]];

const planTimeline = (strokes, box, duration = 2.6) => {
  const rest = [box.x + box.w + 70, box.y + box.h * 0.26];
  const start = [rest[0] + 2400, rest[1] - 1500];
  const segs = [];
  if (!strokes.length) return { segs, total: 0, writeEnd: 0, rest, start };
  const ink = strokes.reduce((s, k) => s + k.len, 0);
  const speed = ink / Math.max(0.4, Number(duration) || 2.6);
  let t = 0, at = start;
  const fly = (to, h0, h1, dur, arc) => {
    segs.push({ kind: "fly", from: at, to, h0, h1, arc, t0: t, t1: t + dur });
    t += dur; at = to;
  };
  strokes.forEach((s, i) => {
    const [a, b] = endsOf(s);
    if (i === 0) fly(a, 4, 0, 0.9, 0);
    else {
      const dist = Math.hypot(a[0] - at[0], a[1] - at[1]);
      fly(a, 0, 0, Math.min(0.42, Math.max(0.14, dist / (speed * 1.7))), Math.min(1, 0.08 + dist / 1400));
    }
    const dur = s.len / speed;
    segs.push({ kind: "draw", i, t0: t, t1: t + dur });
    t += dur; at = b;
  });
  const writeEnd = t;
  fly(rest, 0, 0.55, 0.75, 0.4);
  return { segs, total: t, writeEnd, rest, start };
};

const smooth01 = (t) => t * t * (3 - 2 * t);
const drawEase = (t) => {
  const c = Math.min(1, Math.max(0, t));
  return c * 0.78 + smooth01(c) * 0.22;
};

const penAt = (plan, strokes, t) => {
  const ink = strokes.map(() => 0);
  if (!plan.segs.length) return { x: plan.rest[0], y: plan.rest[1], lift: 0.55, ink };
  let state = null;
  for (const s of plan.segs) {
    if (s.kind === "draw" && t >= s.t1) ink[s.i] = 1;
    if (state || t > s.t1) continue;
    const u = Math.min(1, Math.max(0, (t - s.t0) / (s.t1 - s.t0 || 1)));
    if (s.kind === "draw") {
      const p = drawEase(u);
      ink[s.i] = p;
      const [x, y] = pointAt(strokes[s.i], p * strokes[s.i].len);
      state = { x, y, lift: 0, ink };
    } else {
      const e = s.h0 > 1 ? 1 - Math.pow(1 - u, 3) : smooth01(u);
      state = {
        x: s.from[0] + (s.to[0] - s.from[0]) * e,
        y: s.from[1] + (s.to[1] - s.from[1]) * e,
        lift: s.h0 + (s.h1 - s.h0) * e + Math.sin(Math.PI * u) * s.arc,
        ink,
      };
    }
  }
  if (state) return state;
  return { x: plan.rest[0], y: plan.rest[1], lift: 0.55, ink };
};

const docId = (text) => {
  let h = 2166136261;
  for (const c of String(text == null ? "" : text)) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const hex = (h >>> 0).toString(16).toUpperCase().padStart(8, "0");
  return hex.slice(0, 4) + "-" + hex.slice(4);
};

/* #endregion */

/* ---------- styles (scoped, no dependencies) ---------- */

const SPF_CSS =
  ".spf{--spf-bg:#f3f3f2;--spf-fg:#1d1d1f;--spf-muted:#6c6c70;--spf-line:rgba(20,20,30,.09);--spf-card:#fff;--spf-card-line:rgba(20,20,30,.16);--spf-accent:#2b63d9;--spf-accent-fg:#fff;--spf-shade:.26;--spf-pen-hi:#ffffff;--spf-pen-mid:#f2f2f0;--spf-pen-lo:#c9c9c6;--spf-pen-edge:#aeaeab;" +
  "position:relative;isolation:isolate;overflow:hidden;overflow:clip;container-type:inline-size;display:flex;flex-direction:column;width:100%;background:var(--spf-bg);color:var(--spf-fg);font-family:var(--spf-sans);-webkit-font-smoothing:antialiased;}" +
  ".spf[data-theme=dark],.dark .spf[data-theme=auto]{--spf-bg:#121214;--spf-fg:#f2f2f3;--spf-muted:#9a9aa1;--spf-line:rgba(255,255,255,.09);--spf-card:#1c1c1f;--spf-card-line:rgba(255,255,255,.16);--spf-accent:#4f86ff;--spf-shade:.62;--spf-pen-hi:#fbfbfb;--spf-pen-mid:#e4e4e2;--spf-pen-lo:#a9a9a6;--spf-pen-edge:#7d7d7a;}" +
  ":where(.spf) *,:where(.spf) *::before,:where(.spf) *::after{box-sizing:border-box;}" +
  ":where(.spf) a{color:inherit;text-decoration:none;}" +
  ":where(.spf) button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;}" +
  ":where(.spf) h2,:where(.spf) p,:where(.spf) ul{margin:0;padding:0;}" +
  ".spf-glow{position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(60% 55% at 50% 38%,rgba(255,255,255,.55),transparent 70%);}" +
  ".spf[data-theme=dark] .spf-glow,.dark .spf[data-theme=auto] .spf-glow{background:radial-gradient(60% 55% at 50% 38%,rgba(255,255,255,.045),transparent 70%);}" +
  ".spf-main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(40px,7cqw,96px) 20px clamp(36px,5cqw,64px);text-align:center;}" +
  ".spf-stage{position:relative;width:min(100%,calc(clamp(120px,17cqw,200px) * var(--spf-ar)));aspect-ratio:var(--spf-ar);margin-bottom:clamp(10px,2cqw,22px);touch-action:pan-y;}" +
  ".spf-stage[data-live]{cursor:none;}" +
  ".spf-svg{position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none;overflow:visible;}" +
  ".spf-guide{transition:opacity .9s ease;}" +
  ".spf[data-signed] .spf-guide{opacity:0;}" +
  ".spf[data-theme=dark] .spf-inkg,.dark .spf[data-theme=auto] .spf-inkg{filter:brightness(1.4) saturate(1.1);}" +
  ".spf-scrib{transition:opacity 1.4s ease;}" +
  ".spf-scrib[data-dry]{opacity:0;}" +
  ".spf-again{position:absolute;right:0;bottom:-6px;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border-radius:99px;font-size:12px;font-weight:600;letter-spacing:.01em;color:var(--spf-muted);background:var(--spf-card);box-shadow:0 0 0 1px var(--spf-line),0 6px 18px -10px rgba(0,0,0,.25);opacity:0;transform:translateY(4px);transition:opacity .35s ease,transform .35s ease,color .2s ease;pointer-events:none;cursor:pointer;}" +
  ".spf[data-signed] .spf-stage:hover .spf-again,.spf[data-signed] .spf-again:focus-visible{opacity:1;transform:none;pointer-events:auto;}" +
  ".spf-again:hover{color:var(--spf-fg);}" +
  ".spf-again svg{width:13px;height:13px;max-width:none;transition:transform .5s cubic-bezier(.3,1.4,.5,1);}" +
  ".spf-again:hover svg{transform:rotate(-200deg);}" +
  "@media (hover:none){.spf[data-signed] .spf-again{opacity:.85;transform:none;pointer-events:auto;}}" +
  ".spf-title{font-size:clamp(19px,2.5cqw,27px);font-weight:400;letter-spacing:-.012em;line-height:1.25;text-wrap:balance;}" +
  ".spf-w{display:inline-block;white-space:pre;}" +
  ".spf-desc{margin-top:12px;max-width:66ch;font-size:clamp(13px,1.25cqw,14.5px);line-height:1.6;color:var(--spf-muted);text-wrap:pretty;}" +
  ".spf-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:22px;}" +
  ".spf-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;height:40px;padding:0 18px;border-radius:7px;font-size:14px;font-weight:600;letter-spacing:.005em;white-space:nowrap;transition:transform .25s cubic-bezier(.3,1.4,.5,1),box-shadow .25s ease,background-color .2s ease,filter .2s ease;}" +
  ".spf-btn-secondary{background:var(--spf-card);box-shadow:inset 0 0 0 1px var(--spf-card-line),0 1px 2px rgba(0,0,0,.05);}" +
  ".spf-btn-secondary:hover{box-shadow:inset 0 0 0 1px var(--spf-muted),0 8px 20px -12px rgba(0,0,0,.35);transform:translateY(-1px);}" +
  ".spf-btn-primary{background:var(--spf-accent);color:var(--spf-accent-fg);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 1px 2px rgba(0,0,0,.12),0 8px 22px -12px var(--spf-accent);}" +
  ".spf-btn-primary:hover{filter:brightness(1.07);transform:translateY(-1px);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 2px 4px rgba(0,0,0,.12),0 14px 30px -12px var(--spf-accent);}" +
  ".spf-btn:active{transform:translateY(0) scale(.98);}" +
  ".spf-btn:focus-visible,.spf-again:focus-visible,.spf-link:focus-visible{outline:2px solid var(--spf-accent);outline-offset:3px;}" +
  ".spf-bar{display:flex;align-items:center;justify-content:space-between;gap:16px 28px;flex-wrap:wrap;margin:0 clamp(16px,3cqw,40px);padding:20px 0 24px;border-top:1px solid var(--spf-line);font-size:12.5px;color:var(--spf-muted);}" +
  ".spf-brand{display:inline-flex;align-items:center;gap:9px;color:var(--spf-fg);font-weight:600;font-size:13.5px;letter-spacing:-.005em;}" +
  ".spf-brand svg{width:20px;height:20px;max-width:none;flex:none;}" +
  ".spf-links{display:flex;flex-wrap:wrap;gap:6px 22px;list-style:none;}" +
  ".spf-link{position:relative;padding:2px 0;transition:color .2s ease;}" +
  ".spf-link::after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:1px;background:currentColor;transform:scaleX(0);transform-origin:right;transition:transform .35s cubic-bezier(.6,0,.2,1);}" +
  ".spf-link:hover{color:var(--spf-fg);}" +
  ".spf-link:hover::after{transform:scaleX(1);transform-origin:left;}" +
  ".spf-meta{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}" +
  ".spf-stamp{display:inline-flex;align-items:center;gap:7px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;letter-spacing:.01em;color:var(--spf-muted);opacity:0;transform:translateY(3px);transition:opacity .8s ease .2s,transform .8s ease .2s;}" +
  ".spf-stamp i{width:6px;height:6px;border-radius:99px;background:var(--spf-ink-to);box-shadow:0 0 0 3px color-mix(in srgb,var(--spf-ink-to) 18%,transparent);}" +
  ".spf[data-signed] .spf-stamp{opacity:1;transform:none;}" +
  ".spf-r{opacity:0;transform:translateY(12px);filter:blur(6px);transition:opacity .9s ease,transform 1.1s cubic-bezier(.2,.75,.15,1),filter .9s ease;transition-delay:calc(var(--i,0) * 70ms);}" +
  ".spf[data-revealed] .spf-r{opacity:1;transform:none;filter:blur(0);}" +
  ".spf-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}" +
  "@container (max-width: 640px){.spf-line{stroke-width:13px;}.spf-bar{flex-direction:column;align-items:flex-start;}.spf-actions{width:100%;}.spf-btn{flex:1 1 140px;}}" +
  "@media (prefers-reduced-motion: reduce){.spf-r,.spf-stamp,.spf-guide,.spf-again,.spf-btn,.spf-scrib,.spf-link::after{transition:none;}.spf-r{opacity:1;transform:none;filter:none;}}";

/* Pen proportions in font units */
const NIB = 26, CONE = 300, RAD = 74, ANGLE = -31;

const escHtml = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------- DOM builder ---------- */

function buildFooter(p, layout, plan, uid) {
  const { box, strokes } = layout;
  const padX = 150, padY = 150;
  const vb = {
    x: box.x - padX, y: box.y - padY,
    w: Math.max(1, box.w + padX * 2 + 140),
    h: Math.max(1, box.h + padY * 2),
  };
  const baseline = ASCENT;
  const ids = {
    ink: "spf-ink-" + uid, body: "spf-body-" + uid, nib: "spf-nib-" + uid,
    spec: "spf-spec-" + uid, fade: "spf-fade-" + uid, blur: "spf-blur-" + uid,
    blur2: "spf-blur2-" + uid, wet: "spf-wet-" + uid,
  };

  const inkPaths = strokes.map((s, i) =>
    '<path data-ink="' + i + '" d="' + s.d + '" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>').join("");
  const bleedPaths = strokes.map((s, i) =>
    '<path data-bleed="' + i + '" d="' + s.d + '" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>').join("");

  let n = 0;
  const titleHtml = p.title
    ? '<h2 class="spf-title">' + String(p.title).split(/(\s+)/).filter(Boolean).map((w) =>
        /^\s+$/.test(w) ? escHtml(w)
        : '<span class="spf-w spf-r" style="--i:' + (n++) + '">' + escHtml(w) + "</span>").join("") + "</h2>" : "";
  const descHtml = p.description
    ? '<p class="spf-desc spf-r" style="--i:' + (n + 2) + '">' + escHtml(p.description) + "</p>" : "";
  const actionsHtml = (p.actions && p.actions.length)
    ? '<div class="spf-actions">' + p.actions.map((a, i) =>
        '<a href="' + escHtml(a.href || "#") + '"' + (a.screening ? ' data-screening="1"' : "") + ' class="spf-btn spf-r spf-btn-' + (a.variant || (i === p.actions.length - 1 ? "primary" : "secondary")) +
        '" style="--i:' + (n + 3 + i) + '">' + escHtml(a.label) + "</a>").join("") + "</div>" : "";
  const brandHtml = p.brand
    ? '<span class="spf-brand"><svg viewBox="0 0 20 20" aria-hidden="true"><rect width="20" height="20" rx="5.5" fill="' + escHtml(p.inkTo) + '"/>' +
      '<path d="M5 13.6c1.6-.2 2.6-3.8 3.7-3.8 1 0 .2 3 1.3 3 1.2 0 2.2-4.6 3.6-4.6.8 0 .5 1.4 1.4 1.4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' +
      escHtml(p.brand) + "</span>" : "";
  const linksHtml = (p.links && p.links.length)
    ? '<nav aria-label="Footer"><ul class="spf-links">' + p.links.map((l) =>
        '<li><a class="spf-link" href="' + escHtml(l.href || "#") + '">' + escHtml(l.label) + "</a></li>").join("") + "</ul></nav>" : "";
  const legalText = p.legal !== undefined && p.legal !== null ? p.legal : (p.brand ? "© " + new Date().getFullYear() + " " + p.brand : "");
  const stampShown = p.stamp !== undefined && p.stamp !== null ? p.stamp : "";
  const styleVars =
    "--spf-ar:" + (vb.w / vb.h) + ";" +
    "--spf-sans:" + p.fontSans + ";" +
    "--spf-ink-to:" + p.inkTo + ";" +
    "min-height:" + p.height + ";" +
    (p.accent ? "--spf-accent:" + p.accent + ";" : "") +
    (p.background ? "--spf-bg:" + p.background + ";" : "") +
    (p.foreground ? "--spf-fg:" + p.foreground + ";" : "");

  return '' +
  '<footer class="spf ' + escHtml(p.className || "") + '" data-theme="' + escHtml(p.theme) + '" style="' + styleVars + '">' +
    "<style>" + SPF_CSS + "</style>" +
    '<div class="spf-glow" aria-hidden="true"></div>' +
    '<div class="spf-main">' +
      '<div class="spf-stage">' +
        '<svg class="spf-svg" viewBox="' + vb.x + " " + vb.y + " " + vb.w + " " + vb.h + '" role="img" aria-label="Signature: ' + escHtml(p.word) + '">' +
          "<defs>" +
            '<linearGradient id="' + ids.ink + '" gradientUnits="userSpaceOnUse" x1="' + box.x + '" y1="0" x2="' + (box.x + box.w) + '" y2="0">' +
              '<stop offset="0" stop-color="' + escHtml(p.inkFrom) + '"/><stop offset="1" stop-color="' + escHtml(p.inkTo) + '"/></linearGradient>' +
            '<linearGradient id="' + ids.body + '" gradientUnits="userSpaceOnUse" x1="0" y1="' + (-RAD) + '" x2="0" y2="' + RAD + '">' +
              '<stop offset="0" style="stop-color:var(--spf-pen-lo)"/><stop offset=".1" style="stop-color:var(--spf-pen-mid)"/>' +
              '<stop offset=".3" style="stop-color:var(--spf-pen-hi)"/><stop offset=".55" style="stop-color:var(--spf-pen-mid)"/>' +
              '<stop offset=".84" style="stop-color:var(--spf-pen-lo)"/><stop offset="1" style="stop-color:var(--spf-pen-edge)"/></linearGradient>' +
            '<linearGradient id="' + ids.nib + '" gradientUnits="userSpaceOnUse" x1="0" y1="-9" x2="0" y2="9">' +
              '<stop offset="0" stop-color="#9a9a98"/><stop offset=".35" stop-color="#d9d9d6"/><stop offset="1" stop-color="#6d6d6b"/></linearGradient>' +
            '<linearGradient id="' + ids.spec + '" gradientUnits="userSpaceOnUse" x1="' + CONE + '" y1="0" x2="' + (CONE + 2600) + '" y2="0">' +
              '<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".08" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity=".6"/></linearGradient>' +
            '<linearGradient id="' + ids.fade + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="2600" y2="0">' +
              '<stop offset="0" style="stop-color:#000;stop-opacity:var(--spf-shade)"/><stop offset=".35" style="stop-color:#000;stop-opacity:calc(var(--spf-shade) * .55)"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>' +
            '<filter id="' + ids.blur + '" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="34"/></filter>' +
            '<filter id="' + ids.blur2 + '" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9"/></filter>' +
            '<filter id="' + ids.wet + '" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.2"/></filter>' +
          "</defs>" +
          '<g class="spf-guide" aria-hidden="true" opacity=".55">' +
            '<line x1="' + (box.x - 40) + '" y1="' + (baseline + 50) + '" x2="' + (box.x + box.w + 40) + '" y2="' + (baseline + 50) + '" style="stroke:var(--spf-muted)" stroke-opacity=".45" stroke-width="3" stroke-dasharray="2 16" stroke-linecap="round"/>' +
            '<path d="M' + (box.x - 30) + " " + (baseline - 20) + 'l44 44m0 -44l-44 44" style="stroke:var(--spf-muted)" stroke-opacity=".7" stroke-width="6" stroke-linecap="round" fill="none"/>' +
          "</g>" +
          '<g class="spf-inkg" data-inkgroup style="transition:opacity .45s ease" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
            '<g filter="url(#' + ids.wet + ')" opacity=".2" stroke="url(#' + ids.ink + ')" stroke-width="18">' + bleedPaths + "</g>" +
            '<g class="spf-line" stroke="url(#' + ids.ink + ')" stroke-width="9">' + inkPaths + "</g>" +
          "</g>" +
          '<g data-scrib class="spf-inkg spf-line" fill="none" stroke="url(#' + ids.ink + ')" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<g aria-hidden="true" pointer-events="none">' +
            '<g data-shadow><path d="M0 0L2600 ' + (-RAD * 1.6) + "L2600 " + (RAD * 3.2) + 'Z" fill="url(#' + ids.fade + ')" filter="url(#' + ids.blur + ')"/></g>' +
            '<g data-contact><ellipse cx="70" cy="6" rx="80" ry="16" style="fill:#000;fill-opacity:calc(var(--spf-shade) * 1.1)" filter="url(#' + ids.blur2 + ')"/></g>' +
            "<g data-pen>" +
              '<rect x="' + (CONE - 2) + '" y="' + (-RAD) + '" width="9000" height="' + (RAD * 2) + '" fill="url(#' + ids.body + ')"/>' +
              '<rect x="' + CONE + '" y="' + (-RAD * 0.62) + '" width="9000" height="' + (RAD * 0.16) + '" rx="' + (RAD * 0.08) + '" fill="url(#' + ids.spec + ')" opacity=".9"/>' +
              '<path d="M' + NIB + " " + -9 + "C" + CONE * 0.45 + " " + (-RAD * 0.62) + " " + CONE * 0.78 + " " + (-RAD * 0.98) + " " + CONE + " " + (-RAD) +
                "L" + CONE + " " + RAD + "C" + CONE * 0.78 + " " + (RAD * 0.98) + " " + CONE * 0.45 + " " + (RAD * 0.62) + " " + NIB + ' 9Z" fill="url(#' + ids.body + ')"/>' +
              '<path d="M' + (NIB + 30) + " " + -14 + "C" + CONE * 0.5 + " " + (-RAD * 0.5) + " " + CONE * 0.8 + " " + (-RAD * 0.6) + " " + CONE + " " + (-RAD * 0.62) +
                '" stroke="#fff" stroke-opacity=".9" stroke-width="' + (RAD * 0.12) + '" stroke-linecap="round" fill="none"/>' +
              '<line x1="' + CONE + '" y1="' + (-RAD) + '" x2="' + CONE + '" y2="' + RAD + '" style="stroke:var(--spf-pen-lo)" stroke-width="3" stroke-opacity=".7"/>' +
              '<path d="M0 0Q2 -5 ' + NIB + " -9L" + NIB + ' 9Q2 5 0 0Z" fill="url(#' + ids.nib + ')"/>' +
            "</g>" +
          "</g>" +
        "</svg>" +
        '<button type="button" class="spf-again" aria-label="Sign again">' +
          '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M2.5 8a5.5 5.5 0 1 0 1.7-4"/><path d="M2.2 1.8v2.6h2.6"/></svg>Sign again</button>' +
      "</div>" +
      titleHtml + descHtml + actionsHtml +
    "</div>" +
    '<div class="spf-bar spf-r" style="--i:' + (n + 6) + '">' +
      brandHtml + linksHtml +
      '<div class="spf-meta">' +
        (stampShown
          ? '<span class="spf-stamp" role="status"><i aria-hidden="true"></i>' + escHtml(stampShown) + "</span>"
          : '<span class="spf-stamp" role="status" data-stamp><i aria-hidden="true"></i><span data-stamptext></span></span>') +
        (legalText ? "<span>" + escHtml(legalText) + "</span>" : "") +
      "</div>" +
    "</div>" +
  "</footer>";
}

/* ---------- init ---------- */

const reducedMotion = () =>
  typeof window !== "undefined" && !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

const formatStamp = (word) => {
  let when = "";
  try {
    when = new Intl.DateTimeFormat(undefined, {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date());
  } catch (e) { when = new Date().toDateString(); }
  return "Signed " + when + " · ID " + docId(word);
};

const DEFAULT_PROPS = {
  word: "MindCursor",
  title: "Thank you for exploring every mind",
  description: "MindCursor is an AI-assisted autism awareness and preliminary screening platform. Understand differences. Encourage acceptance.",
  actions: [
    { label: "About MindCursor", href: "#", variant: "secondary" },
    { label: "Start Your Screening", href: "#", variant: "primary", screening: true },
  ],
  brand: "MindCursor",
  links: [
    { label: "About", href: "#" }, { label: "Awareness", href: "#" },
    { label: "Technology", href: "#" }, { label: "Screening", href: "#", screening: true },
    { label: "Privacy Policy", href: "#" }, { label: "Disclaimer", href: "#" },
  ],
  legal: null, stamp: null,
  trigger: "view", duration: 2.6, interactive: true, theme: "dark",
  inkFrom: "#8db2ee", inkTo: "#1f56cc",
  accent: "#0038ff", background: "#0e0e10", foreground: null,
  height: "100svh",
  fontSans: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  onSigned: null, className: "",
};

function initSignatureFooter(mount, props) {
  const p = Object.assign({}, DEFAULT_PROPS, props || {});
  const uid = "u" + Math.random().toString(36).slice(2, 10);
  const layout = layoutWord(p.word);
  const plan = planTimeline(layout.strokes, layout.box, p.duration);
  const { box, strokes } = layout;

  mount.innerHTML = buildFooter(p, layout, plan, uid);
  const root = mount.firstElementChild;
  root.addEventListener("click", function (e) {
    var t = e.target.closest("[data-screening]");
    if (t && window.MindCursor && window.MindCursor.goScreening) {
      e.preventDefault();
      window.MindCursor.goScreening();
    }
  });
  const stage = root.querySelector(".spf-stage");
  const svg = root.querySelector(".spf-svg");
  const pen = root.querySelector("[data-pen]");
  const sh = root.querySelector("[data-shadow]");
  const ct = root.querySelector("[data-contact]");
  const inkGroup = root.querySelector("[data-inkgroup]");
  const scribLayer = root.querySelector("[data-scrib]");
  const againBtn = root.querySelector(".spf-again");
  const stampEl = root.querySelector("[data-stamptext]");

  const sim = {
    x: plan.start[0], y: plan.start[1], lift: 4, angle: ANGLE,
    tx: plan.rest[0], ty: plan.rest[1], tl: 0.55,
    mode: "wait", t0: 0, scroll: 0,
  };
  let raf = 0, io = null;
  const onScrollFns = [];

  const paint = () => {
    if (!pen || !sh || !ct) return;
    const lift = Math.max(0, sim.lift);
    const sc = 1 + Math.min(lift, 4) * 0.035;
    pen.setAttribute("transform", "translate(" + r1(sim.x) + " " + r1(sim.y) + ") rotate(" + r1(sim.angle) + ") scale(" + sc.toFixed(3) + ")");
    const off = lift * 90;
    sh.setAttribute("transform", "translate(" + r1(sim.x + off * 0.62) + " " + r1(sim.y + off * 0.95) + ") rotate(" + r1(sim.angle + 44) + ")");
    sh.style.opacity = String(Math.max(0.25, 1 - lift * 0.16));
    ct.setAttribute("transform", "translate(" + r1(sim.x + off * 0.5) + " " + r1(sim.y + off * 0.8) + ") rotate(" + r1(sim.angle + 44) + ")");
    ct.style.opacity = String(Math.max(0, 1 - lift * 2.2));
  };

  const setInk = (ink) => {
    ink.forEach((pv, i) => {
      const o = String(r1(1000 * (1 - pv)));
      const a = inkGroup.querySelector('[data-ink="' + i + '"]');
      const b = inkGroup.querySelector('[data-bleed="' + i + '"]');
      if (a) a.style.strokeDashoffset = o;
      if (b) b.style.strokeDashoffset = o;
    });
  };

  const setRevealed = (v) => { if (v) root.setAttribute("data-revealed", ""); else root.removeAttribute("data-revealed"); };
  const setSigned = (v) => {
    if (v) root.setAttribute("data-signed", "");
    else root.removeAttribute("data-signed");
  };
  const setLive = (v) => { if (v) stage.setAttribute("data-live", ""); else stage.removeAttribute("data-live"); };
  const setStamp = (t) => { if (stampEl) stampEl.textContent = t; };

  const finishState = { done: false };
  const finish = () => {
    if (finishState.done) return;
    finishState.done = true;
    setSigned(true);
    setStamp(formatStamp(p.word));
    if (typeof p.onSigned === "function") { try { p.onSigned(); } catch (e) {} }
  };

  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const px = sim.x;
    if (sim.mode === "write") {
      const t = p.trigger === "scroll" ? sim.scroll * plan.total : (now - sim.t0) / 1000;
      const st = penAt(plan, strokes, t);
      sim.x = st.x; sim.y = st.y; sim.lift = st.lift;
      setInk(st.ink);
      if (!revealFired && t >= plan.writeEnd * 0.72) { revealFired = true; setRevealed(true); }
      if (t >= plan.total) {
        sim.mode = "rest"; sim.tx = plan.rest[0]; sim.ty = plan.rest[1]; sim.tl = 0.55;
        finish();
        if (p.interactive) setLive(true);
      }
    } else if (sim.mode !== "wait") {
      if (p.trigger === "scroll" && sim.mode === "rest" && sim.scroll < 0.999) sim.mode = "write";
      const k = 1 - Math.exp(-dt * (sim.mode === "rest" ? 6 : 14));
      sim.x += (sim.tx - sim.x) * k;
      sim.y += (sim.ty - sim.y) * k;
      const breathe = sim.mode === "rest" ? Math.sin(now / 900) * 0.07 : 0;
      sim.lift += (sim.tl + breathe - sim.lift) * (1 - Math.exp(-dt * 10));
    }
    vx += ((sim.x - px) / Math.max(dt, 0.001) - vx) * 0.15;
    const lean = Math.max(-6, Math.min(6, vx * 0.0016));
    sim.angle += (ANGLE + lean - sim.angle) * 0.2;
    paint();
    raf = requestAnimationFrame(tick);
  };

  let last = performance.now(), vx = 0, revealFired = false;

  const begin = () => {
    if (sim.mode !== "wait") return;
    sim.mode = "write";
    sim.t0 = performance.now();
  };

  const startLoop = () => {
    cancelAnimationFrame(raf);
    if (io) { io.disconnect(); io = null; }
    onScrollFns.splice(0).forEach((fn) => {
      window.removeEventListener("scroll", fn);
      window.removeEventListener("resize", fn);
    });
    sim.mode = "wait";
    sim.x = plan.start[0]; sim.y = plan.start[1]; sim.lift = 4;
    sim.angle = ANGLE; vx = 0; revealFired = false;
    finishState.done = false;
    setSigned(false); setLive(false); setRevealed(false);
    setInk(strokes.map(() => 0));
    paint();
    last = performance.now();

    if (reducedMotion() || !strokes.length) {
      sim.mode = "rest";
      sim.x = plan.rest[0]; sim.y = plan.rest[1]; sim.lift = 0.55;
      setInk(strokes.map(() => 1));
      paint(); setRevealed(true);
      finish();
      return;
    }

    const onScroll = () => {
      const r = root.getBoundingClientRect();
      const vh = document.documentElement.clientHeight || 1;
      sim.scroll = Math.min(1, Math.max(0, (vh - r.top) / Math.max(1, Math.min(r.height, vh) * 0.85)));
      if (sim.scroll > 0) begin();
    };
    if (p.trigger === "scroll") {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      onScrollFns.push(onScroll);
    } else if (typeof IntersectionObserver === "undefined") {
      begin();
    } else {
      io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { begin(); if (io) io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(stage);
    }
    raf = requestAnimationFrame(tick);
  };

  /* pointer: pen follows cursor, press to write */
  const toSvg = (e) => {
    const m = svg.getScreenCTM();
    if (!m) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [pt.x, pt.y];
  };
  let drawPath = null, drawPts = [];
  const dryTimers = [];
  const onMove = (e) => {
    if (e.pointerType === "touch") return;
    const q = toSvg(e);
    if (!q) return;
    if (sim.mode === "rest") sim.mode = "follow";
    if (sim.mode !== "follow" && sim.mode !== "draw") return;
    sim.tx = q[0]; sim.ty = q[1];
    if (sim.mode === "follow") sim.tl = 0.7;
    if (sim.mode === "draw" && drawPath) {
      const lp = drawPts[drawPts.length - 1];
      if (Math.hypot(q[0] - lp[0], q[1] - lp[1]) < 6) return;
      drawPts.push(q);
      let d = "M" + r1(drawPts[0][0]) + " " + r1(drawPts[0][1]);
      for (let i = 1; i < drawPts.length - 1; i++) {
        const mx = (drawPts[i][0] + drawPts[i + 1][0]) / 2;
        const my = (drawPts[i][1] + drawPts[i + 1][1]) / 2;
        d += "Q" + r1(drawPts[i][0]) + " " + r1(drawPts[i][1]) + " " + r1(mx) + " " + r1(my);
      }
      d += "L" + r1(q[0]) + " " + r1(q[1]);
      drawPath.setAttribute("d", d);
    }
  };
  const onDown = (e) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    if (e.target && e.target.closest && e.target.closest("button")) return;
    const q = toSvg(e);
    if (!q) return;
    e.preventDefault();
    if (stage.setPointerCapture) { try { stage.setPointerCapture(e.pointerId); } catch (err) {} }
    sim.mode = "draw"; sim.tx = q[0]; sim.ty = q[1]; sim.tl = 0;
    drawPts = [q];
    drawPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    drawPath.setAttribute("class", "spf-scrib");
    drawPath.setAttribute("d", "M" + r1(q[0]) + " " + r1(q[1]) + "l0.1 0");
    scribLayer.appendChild(drawPath);
  };
  const onUp = () => {
    if (sim.mode !== "draw") return;
    sim.mode = "follow"; sim.tl = 0.7;
    const done = drawPath; drawPath = null;
    if (done) {
      dryTimers.push(window.setTimeout(() => done.setAttribute("data-dry", ""), 1600));
      dryTimers.push(window.setTimeout(() => { if (done.parentNode) done.parentNode.removeChild(done); }, 3200));
    }
  };
  const onLeave = () => {
    if (sim.mode !== "follow") return;
    sim.mode = "rest"; sim.tx = plan.rest[0]; sim.ty = plan.rest[1]; sim.tl = 0.55;
  };
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onUp);
  stage.addEventListener("pointerleave", onLeave);

  againBtn.addEventListener("click", () => {
    if (sim.mode === "write" || sim.mode === "wait") return;
    sim.mode = "rest"; sim.tx = plan.start[0]; sim.ty = plan.start[1]; sim.tl = 4;
    inkGroup.style.opacity = "0";
    window.setTimeout(() => { inkGroup.style.opacity = ""; startLoop(); }, 520);
  });

  /* hash links shouldn't navigate */
  root.querySelectorAll('a[href="#"]').forEach((a) => {
    a.addEventListener("click", (e) => e.preventDefault());
  });

  startLoop();
  return { replay: () => againBtn.click() };
}

if (typeof window !== "undefined") window.initSignatureFooter = initSignatureFooter;
