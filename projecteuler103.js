

var program = require('commander');

program
    .version('0.1.0')
    .description('Special subset sums: optimum')
    .option('-s, --set_size <int>', 'The set size', Number, 7)
    .parse(process.argv);

var combinatorics = require('js-combinatorics');

var sum = require('compute-sum');

var set = [1];
for (var n = 2; n <= program.set_size; n++) {
    set = algorithm_set(set);
    set = optimum_set(set);
}

console.log(set.sort(num_sort).join(''));

// Algoritmayı kullanarak önceki setten set alma

function algorithm_set(prev_set) {
    var middle = prev_set[Math.floor(prev_set.length / 2)];
    var set = [middle];
    for (var i = 0; i < prev_set.length; i++) {
        set.push(middle + prev_set[i]);
    }

    return set;
}


function optimum_set(algo_set) {
    var n = algo_set.length;

    // Make indices for subsets
    var all_idxs = Array.apply(null, {
        length: n
    }).map(Number.call, Number);
    var subset_idxs = combinatorics.power(all_idxs).toArray();
    subset_idxs.pop();
    subset_idxs.shift();

   
    opt_sum = sum(algo_set);
    opt_set = algo_set;
    var offset_iterator = combinatorics.baseN([-2, -1, 0, 1, 2], n);
    var offset;
    while (offset = offset_iterator.next()) {
        var set = algo_set.map(function(num, i) {
            return num + offset[i];
        });
        var set_sum = sum(set);
        if (set_sum >= opt_sum) {
            continue;
        }
        if (set.sort(num_sort)[0] <= 0) {
            continue;
        }
        if (unique(set).length != set.length) {
            continue;
        }

        // Get all subsets
        var subsets = [];
        var sums = [];
        var lengths = [];
        for (var i = 0; i < subset_idxs.length; i++) {
            var subset = [];
            for (var j = 0; j < subset_idxs[i].length; j++) {
                subset.push(set[subset_idxs[i][j]]);
            }
            subsets.push(subset.sort(num_sort));
            sums.push(sum(subset));
            lengths.push(subset.length);
        }

        // Eşit toplamlı ayrık alt kümeleri kontrol etmek
        var got_disjoint_eq_sum = false;
        var uniq_sums = unique(sums);
        for (var i = 0; i < uniq_sums.length; i++) {
            var indices = [];
            for (var j = 0; j < sums.length; j++) {
                if (sums[j] == uniq_sums[i]) {
                    indices.push(j);
                }
            }
            if (indices.length == 1) {
                continue;
            }
            var pair_iterator = combinatorics.combination(indices, 2);
            var pair;
            while (pair = pair_iterator.next()) {
                if (!intersection(subsets[pair[0]], subsets[pair[1]]).length) {
                    got_disjoint_eq_sum = true;
                    break;
                }
            }
        }
        if (got_disjoint_eq_sum) {
            continue;
        }

        // Farklı uzunluk ve toplamlardaki ayrık alt kümeleri kontrol etmek
        
        var got_disjoint_diff = false;
        var indices = Array.apply(null, {
            length: subsets.length
        }).map(Number.call, Number);
        for (var i = 0; i < subsets.length; i++) {
            for (var j = 0; j < subsets.length; j++) {
                if (lengths[i] < lengths[j] && sums[i] > sums[j] &&
                    !intersection(subsets[i], subsets[j]).length) {
                    got_disjoint_diff = true;
                    break;
                }
            }
        }
        if (got_disjoint_diff) {
            continue;
        }

        opt_sum = sum(set);
        opt_set = set;
    }

    return opt_set;
}

function unique(array) {
    return array.reduce(function(prev, cur) {
        if (prev.indexOf(cur) < 0) {
            prev.push(cur);
        }
        return prev;
    }, []);
}

function intersection(a, b) {
    var i = 0;
    var j = 0;
    var intersect = [];
    while (i < a.length && j < b.length) {
        if (a[i] < b[j]) {
            i++;
        } else if (a[i] > b[j]) {
            j++;
        } else {
            intersect.push(a[i]);
            i++;
            j++;
        }
    }

    return intersect;
}

function num_sort(a, b) {
    return a - b;
}
