(function() {
'use strict';









window.Flame = Ember.Namespace.create();

})();
(function() {
'use strict';

// There's Ember.computed.empty and Ember.computed.notEmpty, but there's no
// counterpart for Ember.computed.equal
Ember.computed.notEqual = function(dependentKey, value) {
    return Ember.computed(dependentKey, function() {
        return value !== Ember.get(this, dependentKey);
    });
};

Flame.computed = {
    trueFalse: function(dependentKey, trueValue, falseValue) {
        return Ember.computed(dependentKey, function() {
            return Ember.get(this, dependentKey) ? trueValue : falseValue;
        });
    }
};

})();
(function() {
'use strict';

/**
  Flame.computed.nearest can be used to created computed properties based on
  properties up in the parentView chain.

  Let's define this computed property:

      bar: Flame.computed.nearest('foo.bar')

  The first time we `get` or `set` this computed property, we search through
  the parentView chain for the first view that has the `foo` property and
  define the following computed property:

      __foo_bar: Ember.computed.alias('parentView.parentView.parentView.foo.bar')

  Any future use of the `get` property will just be an alias to the `__foo_bar`
  property.

  You can also pass a computed property macro as a second argument to `nearest`.

      bar: Flame.computed.nearest('foo.bar', Ember.computed.empty)

  This would then generate the following computed property:

      __foo_bar: Ember.computed.empty('parentView.parentView.parentView.foo.bar')
*/

Flame.computed.nearest = function(key, macro) {
    var propertyName = '__' + key.replace(/\./g, '_');

    return Ember.computed(propertyName, function(k, value) {
        if (!Ember.meta(this).descs[propertyName]) {
            createProperty(this, propertyName, key, macro);
        }
        if (arguments.length > 1) {
            this.set(propertyName, value);
        }
        return this.get(propertyName);
    });
};

var IS_PATH_REGEX = /[\.]/,
    PATH_SPLIT_REGEX = /([^\.]+)(\..*)/;

function createProperty(target, propertyName, property, macro) {
    var rest = '';

    if (IS_PATH_REGEX.test(property)) {
        var match = property.match(PATH_SPLIT_REGEX);
        property = match[1];
        rest = match[2];
    }

    var view = target.get('parentView');
    var path = 'parentView';

    while (view) {
        if (property in view) break;
        view = view.get('parentView');
        path += '.parentView';
    }



    path += '.' + property + rest;

    if (typeof macro === 'undefined') macro = Ember.computed.alias;

    Ember.defineProperty(target, propertyName, macro(path));
}
;

})();
(function() {
'use strict';

// IE < 10 doesn't support -ms-user-select CSS property, so we need to use onselectstart event to stop the selection
if (/msie 9/i.test(window.navigator.userAgent)) {
    Ember.$(function() {
        Ember.$('body').on('selectstart', function(e) {
            var target = Ember.$(e.target);
            return ['INPUT', 'TEXTAREA'].contains(e.target.tagName) ||
                target.parents().andSelf().is('.is-selectable') ||
                target.attr('contenteditable') === 'true';
        });
    });
}
;

})();
(function() {
'use strict';

Flame.imagePath = 'images/';

})();
(function() {
'use strict';


Ember.mixin(Flame, {
    image: function(imageUrl) {
        if (typeof FlameImageUrlPrefix === 'undefined') {
            return (Flame.imagePath || '') + imageUrl;
        } else {
            return FlameImageUrlPrefix + imageUrl;
        }
    }
});

})();
(function() {
'use strict';

jQuery.fn.selectRange = function(start, end) {
    return this.each(function() {
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};

/** Clone an element, removing metamorph binding tags and ember metadata */
jQuery.fn.safeClone = function() {
    var clone = jQuery(this).clone();
    // Remove content bindings
    clone.find('script[id^=metamorph]').remove();

    // Remove attr bindings
    clone.find('*').each(function() {
        var $this = jQuery(this);
        var i, attribute;
        var length = $this[0].attributes.length;
        for (i = 0; i < length; i++) {
            attribute = $this[0].attributes[i];
            if (attribute && /^data-(bindattr|ember)/.test(attribute.name)) {
                $this.removeAttr(attribute.name);
            }
        }
    });

    // Remove ember ids
    clone.find('[id^=ember]').removeAttr('id');

    return clone;
};

})();
(function() {
'use strict';

/**
  This stuff solves two recurring problems with bindings:
    1) you often need several bindings to the same controller,
    2) you may want to use bindings to 'configure' views nested deep in the hierarchy.

  One option would be to have one binding on the top level in the view definition, then
  bind to that in the child views, but that's also suboptimal because you need a lot of
  parentView.parentView... type paths which are not robust w.r.t. changes in the view
  hierarchy. So here's how to do it:

  fooView1: Flame.View.extend({
    controllerPath: 'MyApp.someController',
    fooAction: 'MyApp.createFoo',

    fooView2: Flame.View.extend({
      fooView3: Flame.View.extend({
        foobarBinding: '$controllerPath.someProperty'  // Binds to MyApp.someController.someProperty
      }),
      fooView4: Flame.ButtonView.extend({
        foobarBinding: '$controllerPath.anotherProperty',  // Binds to MyApp.someController.anotherProperty
        actionBinding: '^fooAction'  // Binds to parentView.parentView.fooAction
      })
    })
  })

  Put in a bit more formal way:

    $<propertyName>[.<path>] => looks up propertyName in parent view/s, uses its value to prefix
                                given path, and binds to the resulting path
    ^<propertyName>[.<path>] => looks up propertyName in parent view/s and uses the path to that
                                to prefix given path

  Another way to think of this is that $propertyName expands to the value of that property,
  whereas ^propertyName expands to the path to that property.

  Beware that the latter syntax only works when the property you're binding to has a value
  other than 'undefined' at the time when the views are created. However it does work if it's
  defined by a binding, even if the binding hasn't been synchronized yet.

  A note about implementation: This kind of bindings are bound in Flame._bindPrefixedBindings,
  which needs to be explicitly called from the init of all root views (views that don't have
  parents). I have tried to make this more automagic by overriding Ember.Binding.connect. While
  it's easy to detect prefixed bindings there, the basic problem is that parentView is not
  yet set at that point. One possible approach is to add the prefixed bindings to a queue
  in connect and then process them later. However, the obj in connect is not the same as
  the final view object, but instead some kind of intermediate object that is then presumably
  wrapped later (in the prototype chain I assume) to become the real thing. Trying to bind
  to the intermediate object later doesn't work, and I cannot figure out a way to work out
  the final object, given the intermediate one (might be impossible). Thus, we're currently
  stuck with this implementation (which works but might get slow - it has to go through all
  properties of all views).
*/


var IS_PREFIXED_BINDING = /^[\^\$]/;
Ember.mixin(Ember.Binding.prototype, {
    connect: function(obj) {
        if (!IS_PREFIXED_BINDING.test(this._from)) return this._super(obj);
    }
});

var IS_BINDING = /Binding$/;
var PREFIXED_BINDING = /^(\^|\$)([^.]+)(.*)$/;
Flame.reopen({
    // Bind our custom prefixed bindings. This method has to be explicitly called after creating a new child view.
    _bindPrefixedBindings: function(view) {
        var foundPrefixedBindings = false;
        for (var key in view) {
            if (this._bindPrefixed(key, view)) {
                foundPrefixedBindings = true;
            }
        }
        return foundPrefixedBindings;
    },

    _bindPrefixed: function(key, view) {
        var foundPrefixedBindings = false;
        if (IS_BINDING.test(key)) {
            var binding = view[key];


            var m = binding._from.match(PREFIXED_BINDING);
            if (m) {
                foundPrefixedBindings = true;
                var useValue = m[1] === '$';
                var property = m[2];
                var suffix = m[3];
                var prefix;

                if (useValue) {
                    prefix = this._lookupValueOfProperty(view, property);
                } else {
                    prefix = this._lookupPathToProperty(view, property);
                }

                // Ember.assert("Don't use prefixed bindings to bind to a value in the parent view", prefix !== 'parentView.' + property);

                var finalPath = prefix + suffix;
                // Copy transformations and the ilk.
                var newBinding = binding.copy();
                newBinding._from = finalPath;
                newBinding.connect(view);
                // Make debugging easier
                binding._resolved_form = newBinding._resolved_form = newBinding._from;
                binding._unresolved_form = newBinding._unresolved_form = binding._from;
            }
        }
        return foundPrefixedBindings;
    },

    _lookupValueOfProperty: function(view, propertyName) {
        var cur = view, value;

        while (value === undefined && value !== null && cur !== undefined && cur !== null) {
            value = cur.get(propertyName);
            cur = cur.get('parentView');
        }

        return value;
    },

    _lookupPathToProperty: function(view, propertyName) {
        var path = [propertyName, 'parentView'];
        var cur = view.get('parentView');
        // Sometimes there's a binding but it hasn't 'kicked in' yet, so also check explicitly for a binding
        var bindingPropertyName = propertyName + 'Binding';

        while (!Ember.isNone(cur)) {
            // It seems that earlier (at least 0.9.4) the constructor of the view contained plethora of properties,
            // but nowadays (at least 0.9.6) the properties are there throughout the prototype-chain and not in the
            // last prototype. Thus testing whether current objects prototype has the property does not give correct
            // results.
            // So we check if the current object has the property (perhaps some of its prototypes has it) or it has
            // a binding for the property and in case it has, this object is the target of our binding.
            if (typeof Ember.get(cur, propertyName) !== "undefined" || typeof Ember.get(cur, bindingPropertyName) !== "undefined") {
                return path.reverse().join('.');
            }
            path.push('parentView');
            cur = cur.get('parentView');
        }

        return undefined;
    }
});

})();
(function() {
'use strict';

var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelRequestAnimationFrame = window[vendors[x] +
      'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
}

if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}
;

})();
(function() {
'use strict';

/**
  A proxy that views the source array as sorted by given sort key and updates the sort key if the
  order of the items in the proxied array is changed. You can use this proxy in combination with
  a list view or tree view - that way, the concern of how to persist the order of the items is
  separated from the view. (Another reason for the existence of this class is that directly using
  sorted arrays backed by sproutcore-datastore is a bit problematic in that updating the sort index
  for any item results in the entire array being emptied and then re-populated.) Usage:

    array = [{index: 4, name: 'foo'}, {index: 1, name: 'bar'}]
    sortedArray = Flame.SortingArrayProxy.create({sortKey: 'index', source: array})

  Now if you reorder the proxy (with removeAt+insertAt pair), the index property will be updated
  on each item. If new items are added to the source, they appear in the proxy array in the correct
  position, and removing an item in the source results in it being removed from the proxy array.
  Similarly, insertions and removals in the proxy are reflected in the source array.

  Note that we don't keep the indexes strictly sequential, we only care about their relative order
  (in other words, there may be gaps after removal). This is to prevent unnecessary datastore
  updates. The sortkeys are preserved, if you create a proxied array with source that has sortkeys
  [1, 3, 5], and then swap items, the resulting source will still only use the [1, 3, 5] as sortkeys
  instead of e.g. [1, 2, 3].

  (Why give the source as 'source', not 'content', as is customary? Because it seems that then would
  need to re-implement all methods needed for array proxying, whereas with this approach we can just
  let Ember.ArrayProxy do the heavy lifting (we set 'content' as the sorted array). Or maybe I just can't
  figure out how to do it easily... Note that ArrayProxy does not keep a copy of the proxied array,
  but instead proxies all method calls directly. Here we really need to have a sorted copy, because
  sorting obviously changes the item indexes, and rewriting all operations and observers on the fly
  sounds like too difficult to implement.)
*/

Flame.SortingArrayProxy = Ember.ArrayProxy.extend({
    sortKey: 'position',
    parent: null,
    _suppressObservers: false,

    init: function() {
        this._sourceDidChange();
        this._super();

        this.get('content').addArrayObserver(this, {
            willChange: '_contentArrayWillChange',
            didChange: '_contentArrayDidChange'
        });
    },

    // This is a hack go work around a weird problem... We need to initialize content to [], but if
    // we do that in init(), it will in some cases fire an observer in ArrayProxy *after* the runloop
    // ends, which causes very bad things to happen. Don't really know why that happens... Anyway
    // with this hack we can avoid firing any observers on the content property.
    content: function(key, value) {
        if (value !== undefined) {
            this.set('_content', value);
        }

        var content = this.get('_content');
        if (content === undefined) {
            this.set('_content', content = []);
        }
        return content;
    }.property().volatile(),

    // When moving an item, use this sequence of calls:
    //  * startMoving()
    //  * removeAt(...)
    //  * insertAt(...)
    //  * endMoving()
    // This way the source array is not modified at all, only the sort keys are updated in
    // endMoving. This is needed in case the source array is not be modifiable (as is the
    // case with arrays returned by sproutcore-datastore queries).
    startMoving: function() {
        this._suppressObservers = true;
    },

    endMoving: function() {
        this._suppressObservers = false;

        var content = this.get('content');
        var sortKey = this.get('sortKey');
        this._withObserversSuppressed(function() {
            this._reAssignSortKeys(content, sortKey);
        }, this);
    },

    _sourceWillChange: function() {
        var source = this.get('source');
        if (source) {
            var self = this;
            source.forEach(function(item) {
                self._removeSortIndexObserverFor(item);
            });

            source.removeArrayObserver(this, {
                willChange: '_sourceArrayWillChange',
                didChange: '_sourceArrayDidChange'
            });
        }
    }.observesBefore('source'),

    _sourceDidChange: function() {
        var source = this.get('source');
        if (source) {
            var sourceCopy = source.slice();  // sort mutates the array, have to make a copy
            this._sort(sourceCopy);

            var content = this.get('content');
            content.replace(0, content.get('length'), sourceCopy);

            var self = this;
            content.forEach(function(item) {
                self._addSortIndexObserverAndRegisterForRemoval(item);
            });

            source.addArrayObserver(this, {
                willChange: '_sourceArrayWillChange',
                didChange: '_sourceArrayDidChange'
            });
        }
    }.observes('source'),

    _addSortIndexObserverAndRegisterForRemoval: function(item) {
        var sortKey = this.get('sortKey');
        // Unfortunately the data store triggers a property change for all properties in a couple of fairly common
        // situations (reloading, and setting child values), so we check if the sort key really changed, so
        // we don't do unnecessary work
        item.lastPosition = item.get(sortKey);
        var observer = function() {
            this._indexChanged(item);
        };
        Ember.addObserver(item, sortKey, this, observer);

        // The challenge here is that to be able to remove an observer, we need the observer function, and
        // that is created dynamically, so we need to store it somewhere... easiest on the item itself.
        item[this.get('observerKey')] = observer;
    },

    // Removes the observer from the item
    _removeSortIndexObserverFor: function(item) {
        var observer = item[this.get('observerKey')];
        if (observer) {
            Ember.removeObserver(item, this.get('sortKey'), this, observer);
            delete item[this.get('observerKey')];
        }
    },

    _getObserverKey: function() {
        return '__observer_' + Ember.guidFor(this);
    }.property(),

    // Observes changes on the sortKey for each item in the source array. When changes, we simply
    // replace the items in our content array with a newly sorted copy. This means that from the
    // point of view of whoever's using this proxy (and observing changes), all items get replaced.
    // We could write something more sophisticated and just remove/insert the moved item, but this
    // should be fine at least for now (changes originating from sortKey updates indicate changes
    // in the backend by some other user, which is rare).
    _indexChanged: function(contentItem) {
        // Don't do anything if sort index didnt change
        if (contentItem.lastPosition === contentItem.get(this.get('sortKey')) || this._suppressObservers) return;  // Originating from us?
        this._sortAndReplaceContent(this.get('content').slice());
    },

    // When items are removed from the source array, we have to remove the sort index observer on them
    // and remove them from the content array.
    _sourceArrayWillChange: function(source, start, removeCount, addCount) {
        var content = this.get('content');
        var self = this;
        this._withObserversSuppressed(function() {
            if (start === 0 && removeCount === content.get("length")) { // Optimize for mass changes.
                // Assumes that source and content arrays contain the same stuff
                content.replace(0, removeCount);
                content.forEach(function(item) { self._removeSortIndexObserverFor(item); });
            } else {
                for (var i = start; i < start + removeCount; i++) {
                    var removedItem = source.objectAt(i);
                    content.removeObject(removedItem);
                    this._removeSortIndexObserverFor(removedItem);
                }
            }
        }, this);
        // No need to sort here, removal doesn't affect sort order
    },

    // When new items are added to the source array, we have to register sort index observer on them
    // and add them to the content array, maintaining correct sort order.
    _sourceArrayDidChange: function(source, start, removeCount, addCount) {
        var contentCopy = this.get('content').slice();

        if (addCount > 0) {
            for (var i = start; i < start + addCount; i++) {
                var addedItem = source.objectAt(i);
                this._addSortIndexObserverAndRegisterForRemoval(addedItem);
                contentCopy.push(addedItem);
            }
            this._sortAndReplaceContent(contentCopy);  // Only sort if there was additions
        }
    },

    _contentArrayWillChange: function(content, start, removeCount, addCount) {
        var source = this.get('source');
        this._withObserversSuppressed(function() {
            for (var i = start; i < start + removeCount; i++) {
                var removedItem = content.objectAt(i);
                source.removeObject(removedItem);
                this._removeSortIndexObserverFor(removedItem);
            }
        }, this);
    },

    _contentArrayDidChange: function(content, start, removeCount, addCount) {
        if (addCount > 0) {
            var sortKey = this.get('sortKey');
            var source = this.get('source');
            this._withObserversSuppressed(function() {
                this._reAssignSortKeys(content, sortKey);
                for (var i = start; i < start + addCount; i++) {
                    var addedItem = content.objectAt(i);
                    this._addSortIndexObserverAndRegisterForRemoval(addedItem);
                    source.pushObject(addedItem);
                }
            }, this);
        }
    },

    _reAssignSortKeys: function(content, sortKey) {
        // Preserve the original sort keys. If there are new items without sortKeys,
        // use the previous items key, or zero in case its the first item
        var keys = [];
        content.mapProperty(sortKey).forEach(function(key, index) {
            if (key === undefined && index === 0) keys.push(0);
            else if (key === undefined) keys.push(keys[index - 1]);
            else keys.push(key);
        });

        keys.sort(function(key1, key2) {
            return Ember.compare(key1, key2);
        });

        // Assign the updated ordering with old sort keys
        content.forEach(function(item, i) {
            Ember.set(item, sortKey, keys[i]);
        });
    },

    // TODO might be useful to make the replacing more fine-grained?
    _sortAndReplaceContent: function(newContent) {
        var content = this.get('content');


        this._sort(newContent);
        this._withObserversSuppressed(function() {
            content.replace(0, content.get('length'), newContent);
        });
    },

    _sort: function(array) {
        var sortKey = this.get('sortKey');
        array.sort(function(o1, o2) {
            return Ember.compare(Ember.get(o1, sortKey), Ember.get(o2, sortKey));
        });
    },

    _withObserversSuppressed: function(func, thisArg) {
        if (this._suppressObservers) return;  // If already suppressed, abort
        if (!thisArg) thisArg = this;

        this._suppressObservers = true;
        try {
            func.call(thisArg);
        } finally {
            this._suppressObservers = false;
        }
    }

});

})();
(function() {
'use strict';

Ember.mixin(Flame, {
    _setupStringMeasurement: function(parentClasses, elementClasses, additionalStyles) {
        if (!parentClasses) parentClasses = '';
        if (!elementClasses) elementClasses = '';
        if (!additionalStyles) additionalStyles = '';

        var element = this._metricsCalculationElement;
        if (!element) {
            var parentElement = document.createElement('div');
            parentElement.style.cssText = 'position:absolute; left:-10010px; top:-10px; width:10000px; visibility:hidden;';
            element = this._metricsCalculationElement = document.createElement('div');
            parentElement.appendChild(element);
            document.body.insertBefore(parentElement, null);
        }

        element.parentNode.className = parentClasses;
        element.className = elementClasses;
        element.style.cssText = 'position:absolute; left: 0; top: 0; bottom: auto; right: auto; width: auto; height: auto;' + additionalStyles;
        return element;
    },

    measureString: function(stringOrArray, parentClasses, elementClasses, additionalStyles) {
        var escape = Handlebars.Utils.escapeExpression;
        var measuredString;
        // We also accept an array of strings and then return the width of the longest one by joining them with <br>.
        if (Ember.isArray(stringOrArray)) {
            measuredString = stringOrArray.reduce(function(currentStrings, nextString) {
                        return currentStrings + escape(nextString) + '<br>';
                    }, '');
        } else {
            measuredString = escape(stringOrArray);
        }
        var element = this._setupStringMeasurement(parentClasses, elementClasses, additionalStyles);
        element.innerHTML = measuredString;
        return {
            width: element.clientWidth,
            height: element.clientHeight
        };
    }
});

})();
(function() {
'use strict';

Flame.TableCell = function TableCell(opts) {
    this.value = null;
    for (var key in opts) {
        if (opts.hasOwnProperty(key)) {
            this[key] = opts[key];
        }
    }
};

Flame.TableCell.prototype.content = function() {
    return this.formattedValue();
};

Flame.TableCell.prototype.formattedValue = function() {
    return this.value === null ? '' : this.value;
};

Flame.TableCell.prototype.editableValue = function() {
    throw new Error('Not implemented');
};

Flame.TableCell.prototype.validate = function(newValue) {
    return true;
};

Flame.TableCell.prototype.formatValueForBackend = function(value) {
    throw new Error('Not implemented');
};

Flame.TableCell.prototype.isEditable = function() {
    return false;
};

Flame.TableCell.prototype.isCopyable = function() {
    return true;
};

Flame.TableCell.prototype.isPastable = function() {
    return true;
};

// Returns an array of CSS classes for this cell
Flame.TableCell.prototype.cssClasses = function() {
    return [];
};

Flame.TableCell.prototype.cssClassesString = function() {
    return this.cssClasses().join(' ');
};

})();
(function() {
'use strict';

Flame.TableHeader = Ember.Object.extend({
    isClickable: false,

    headerLabel: Ember.computed.alias('label'),
    isLeaf: Ember.computed.not('children'),

    createCell: function(data) {
        throw new Error('Not implemented');
    }
});

})();
(function() {
'use strict';

Flame.TableSortSupport = {
    sortAscendingCaption: 'Sort ascending...',
    sortDescendingCaption: 'Sort descending...',

    sortContent: function(sortDescriptor) {
        throw new Error('Not implemented!');
    },

    columnHeaderClicked: function(header, targetElement) {
        if (!header.get('isLeaf')) return;
        this._showSortMenu(header, this._sortMenuOptions(header), targetElement);
    },

    _showSortMenu: function(header, options, anchorView) {
        Flame.MenuView.create({
            minWidth: anchorView.outerWidth(),
            items: options,
            target: this,
            action: 'sortContent',
            payload: Ember.computed.alias('value')
        }).popup(anchorView);
    },

    _sortMenuOptions: function(header) {
        return [
            {title: this.get('sortAscendingCaption'), value: {header: header, order: 'asc'}},
            {title: this.get('sortDescendingCaption'), value: {header: header, order: 'desc'}}
        ];
    }
};

})();
(function() {
'use strict';

Flame.TableViewContentAdapter = Ember.Object.extend({
    content: null,

    headers: function() {
        return this.get('content._headers');
    }.property('content._headers'),

    columnLeafs: function() {
        return this.get('content.columnLeafs');
    }.property('content.columnLeafs'),

    rowLeafs: function() {
        return this.get('content.rowLeafs');
    }.property('content.rowLeafs'),

    columnHeaderRows: function() {
        var columnHeaderRows = [];
        var headers = this.get('headers');
        var columnHeaders = headers.columnHeaders;
        var columnHeadersLength = columnHeaders.length;
        var i;
        for (i = 0; i < columnHeadersLength; i++) {
            this._processHeader(columnHeaderRows, columnHeaders[i], 'columns', 0, false, i);
        }

        columnHeaderRows.maxDepth = Math.max.apply(Math, this.get('columnLeafs').mapProperty('depth'));
        for (i = 0; i < this.get('columnLeafs').length; i++) {
            var colLeaf = this.get('columnLeafs')[i];
            colLeaf.rowspan = columnHeaderRows.maxDepth - colLeaf.depth + 1;
        }

        return columnHeaderRows;
    }.property('headers'),

    rowHeaderRows: function() {
        var rowHeaderRows = [[]];
        var headers = this.get('headers');
        var rowHeaders = headers.rowHeaders;
        var rowHeadersLength = rowHeaders.length;
        var i;
        for (i = 0; i < rowHeadersLength; i++) {
            this._processHeader(rowHeaderRows, rowHeaders[i], 'rows', 0, i === 0, i);
        }

        rowHeaderRows.maxDepth = Math.max.apply(Math, this.get('rowLeafs').mapProperty('depth'));
        for (i = 0; i < this.get('rowLeafs').length; i++) {
            var rowLeaf = this.get('rowLeafs')[i];
            rowLeaf.colspan = rowHeaderRows.maxDepth - rowLeaf.depth + 1;
        }

        return rowHeaderRows;
    }.property('headers'),

    clear: function() {
        this._headers = null;
        this.propertyDidChange('headers');
    },

    /**
      Calculate the colspan (rowspan) attribute to be used when rendering.
      Rowspan (colspan) will be calculated later on.
      Store the headers in a structure similar to the way they will be rendered,
      i.e. (for column headers) an array of rows where each row is an array of cells.
    */
    _processHeader: function(headerRows, header, type, depth, isFirst, index) {
        header.depth = depth + 1;
        header.dataIndex = index;

        // This representation is much easier to render
        if (type === 'columns') {
            if (!headerRows[depth]) { headerRows[depth] = []; }
            headerRows[depth].push(header);
        } else if (type === 'rows') {
            if (!isFirst) { headerRows.push([]); }
            headerRows[headerRows.length - 1].push(header);
        }

        var count = 0;
        if (header.hasOwnProperty('children')) {
            var children = header.children;
            var length = children.length;
            for (var i = 0; i < length; i++) {
                var child = children[i];
                count += this._processHeader(headerRows, child, type, depth + 1, i === 0, index);
            }
        } else {
            count = 1;
        }

        if (type === 'columns') {
            header.colspan = count;
        } else {
            header.rowspan = count;
        }

        return count;
    }
});

})();
(function() {
'use strict';

function createProxyMethod(methodName) {
    return function() {
        var length = arguments.length;
        var args = Array(length + 1);
        args[0] = methodName;
        for (var i = 1; i < length + 1; i++) {
            args[i] = arguments[i - 1];
        }
        return this.invokeStateMethod.apply(this, args);
    };
}

Flame.State = Ember.Object.extend({
    gotoFlameState: function(stateName) {
        this.get('owner').gotoFlameState(stateName);
    },

    // Touch events sometimes hide useful data in an originalEvent sub-hash.
    normalizeTouchEvents: function(event) {
        if (!event.touches) {
            event.touches = event.originalEvent.touches;
        }
        if (!event.pageX) {
            event.pageX = event.originalEvent.pageX;
        }
        if (!event.pageY) {
            event.pageY = event.originalEvent.pageY;
        }
        if (!event.screenX) {
            event.screenX = event.originalEvent.screenX;
        }
        if (!event.screenY) {
            event.screenY = event.originalEvent.screenY;
        }
        if (!event.clientX) {
            event.clientX = event.originalEvent.clientX;
        }
        if (!event.clientY) {
            event.clientY = event.originalEvent.clientY;
        }
        return event;
    },

    $: function() {
        var owner = this.get('owner');
        return owner.$.apply(owner, arguments);
    }
});

Flame.State.reopenClass({
    gotoFlameState: function(stateName, returnValue) {
        return function() {
            this.gotoFlameState(stateName);
            return returnValue === undefined ? true : returnValue;
        };
    }
});

Flame.Statechart = {
    initialFlameState: null,
    currentFlameState: undefined,

    init: function() {
        this._super();

        // Look for defined states and initialize them
        for (var key in this) {
            var state = this[key];
            if (Flame.State.detect(state)) {
                this[key] = state.create({ owner: this, name: key });
                this._setupProxyMethods(this[key]);
            }
        }

        this.gotoFlameState(this.get('initialFlameState'));
    },

    /**
      Sets up proxy methods so that methods called on the owner of the statechart
      will be invoked on the current state if they are not present on the owner of
      the statechart.
    */
    _setupProxyMethods: function(state) {
        for (var property in state) {
            if (state.constructor.prototype.hasOwnProperty(property) && typeof state[property] === 'function' &&
                !this[property] && property !== 'enterState' && property !== 'exitState') {
                this[property] = createProxyMethod(property);
            }
        }
    },

    gotoFlameState: function(stateName) {

        var currentFlameState = this.get('currentFlameState');
        var newState = this.get(stateName);
        // do nothing if we are already in the state to go to
        if (currentFlameState === newState) {
            return;
        }
        if (!Ember.isNone(newState) && newState instanceof Flame.State) {
            if (!Ember.isNone(currentFlameState)) {
                if (currentFlameState.exitState) currentFlameState.exitState();
            }
            this.set('currentFlameState', newState);
            if (newState.enterState) newState.enterState();
        } else {
            throw new Error('%@ is not a state!'.fmt(stateName));
        }
    },

    invokeStateMethod: function(methodName) {
        for (var length = arguments.length, args = Array(length - 1), i = 1; i < length; i++) {
            args[i - 1] = arguments[i];
        }
        var state = this.get('currentFlameState');

        var method = state[methodName];
        if (typeof method === 'function') {
            return method.apply(state, args);
        } else if (methodName === 'keyDown') {
            args.unshift(methodName);
            return !this._handleKeyEvent.apply(this, args);
        }
    }
};

})();
(function() {
'use strict';

/**
  A controller that you need to use when displaying an Flame.TableView. You need to
  define _headers property and call pushDataBatch to render data (can be called
  several times to render data in batches). The headers should be Flame.TableHeader
  objects.

  There are two refined subclasses of this controller, DataTableController and
  ArrayTableController, which you may find easier to use for simple tables.
*/

Flame.TableController = Ember.Object.extend({
    dirtyCells: [],
    valuesOn: 'column',
    isLoading: false,

    tableDataBinding: '_data',
    headerDataBinding: '_headers',

    /**
      Takes in an array of cell value objects, e.g.
      [{path: [2,3,8,5], value: 'MRP', count: 1, all_equal: true}, {...}]

      This data is converted to a 2-dimensional array of cells, where each cell
      is either null or an instance of the Cell class (null values represent
      cells for which data has not yet been pushed). The cell instances are
      created by calling TableHeader#createCell for either the corresponding
      row or column header (depending on 'valuesOn' property).

      The path given in the cell value object will be translated to a coordinate
      in the grid of cells. This index will be added to the dirtyCells property,
      which is an array that is used as a FIFO queue. This dirtyCells array is
      used when rendering to only update the cells that have changed since the
      last render.
    */
    pushDataBatch: function(dataBatch) {
        if (dataBatch !== undefined) {
            var headers = this.get('_headers');
            if (!headers) {
                throw new Error("Can't push data without first setting headers!");
            }

            if (!this._dataBatchIsForCurrentTable(dataBatch)) return;

            var dirtyCells = this.get('dirtyCells').slice(); // clone array
            var valuesOn = this.get('valuesOn');
            var fields = this.get(valuesOn + 'Leafs');
            var rowLeafs = this.get('rowLeafs');
            var columnLeafs = this.get('columnLeafs');

            var _data = this.get('_data');
            var length = dataBatch.length;
            var mapping = this.get("_indexFromPathMapping");
            var cell, index;
            var existingObject;
            for (var i = 0; i < length; i++) {
                cell = dataBatch[i];
                index = mapping[cell.path.row][cell.path.column];
                cell.rowHeaderParams = rowLeafs[index[0]].params;
                cell.columnHeaderParams = columnLeafs[index[1]].params;
                cell = fields[index[valuesOn === 'row' ? 0 : 1]].createCell(cell);
                // Cell attributes might have been updated before it's loaded (for example isUpdating might be set while data is still being batched),
                // in this case pending attributes are recorded in a placeholder object with "pending" attribute.
                existingObject = _data[index[0]][index[1]];
                if (existingObject && existingObject.pending) {
                    for (var pendingAttributeName in existingObject.pending) {
                        cell[pendingAttributeName] = existingObject.pending[pendingAttributeName];
                    }
                }
                _data[index[0]][index[1]] = cell;
                dirtyCells.push(index);
            }
            this.set('dirtyCells', dirtyCells);
        }
    },

    // If the table is changed (e.g. by loading another data set into it) during batching,
    // it can get out of sync - i.e. callbacks receive batches for now obsolete cells, which in turn would
    // crash the UI as it would try to access missing cells.
    // Here we'll ensure that the batch belongs actually to current table by checking if first AND last
    // item in the batch are accessible.
    _dataBatchIsForCurrentTable: function(dataBatch) {
        var length = dataBatch.length;
        var mapping = this.get("_indexFromPathMapping");
        return length > 0 ? mapping[dataBatch[0].path.row] && mapping[dataBatch[length - 1].path.row] : false;
    },

    _indexFromPathMapping: function() {
        // To use an object as a map, each key needs to have a unique toString()-value. As arrays translate into
        // comma-separated list of their content and our content is just simple numbers and each number has a unique
        // string representation, we can use the path arrays here directly.
        var mapping = {};
        var rowLeafs = this.get('rowLeafs');
        var rowLeafsLen  = rowLeafs.length;
        var columnLeafs = this.get('columnLeafs');
        var columnLeafsLen = columnLeafs.length;

        var i, j;
        var rowCell, colCell;
        var rowMapping;
        for (i = 0; i < rowLeafsLen; i++) {
            rowCell = rowLeafs[i];
            rowMapping = mapping[rowCell.path] = {};
            for (j = 0; j < columnLeafsLen; j++) {
                colCell = columnLeafs[j];
                rowMapping[colCell.path] = [i, j];
            }
        }
        return mapping;
    }.property("rowLeafs", "columnLeafs"),

    rowLeafs: function() {
        var headers = this.get('_headers');
        if (!headers) { return null; }
        return this._getLeafs(headers.rowHeaders, []);
    }.property('_headers', '_headers.columns'),
    // _headers.columns is really a nonexistent attribute, but adding it appears to trigger cache invalidation, which
    // prevents rowLeafs and columnLeafs from returning invalid data. FIXME: When upgrading Ember.js, it should be
    // tested if this hack is still necessary.

    columnLeafs: function() {
        var headers = this.get('_headers');
        if (!headers) { return null; }
        return this._getLeafs(headers.columnHeaders, []);
    }.property('_headers', '_headers.columns'),

    pathFromIndex: function(index) {
        var rowLeafs = this.get('rowLeafs');
        var columnLeafs = this.get('columnLeafs');
        return {row: rowLeafs[index[0]].path, column: columnLeafs[index[1]].path};
    },

    // Translate a path to an index in the 2-dimensional grid of data
    indexFromPath: function(path) {
        var mapping = this.get('_indexFromPathMapping');
        return mapping[path.row][path.column];
    },

    // Collect leaf nodes and record path to get to each leaf
    _getLeafs: function(nodes, path) {
        var node, length = nodes.length;
        var leafs = [];
        var i;
        for (i = 0; i < length; i++) {
            node = nodes[i];
            if (node.hasOwnProperty('children')) {
                var newPath = node.hasOwnProperty('id') ? path.concat(node.id) : path;
                leafs = leafs.concat(this._getLeafs(node.children, newPath));
            } else {
                node.path = path.concat(node.id);
                leafs.push(node);
            }
        }
        // Mark the leaf index
        for (i = 0; i < leafs.length; i++) {
            leafs[i].leafIndex = i;
        }
        return leafs;
    },

    // When setting headers, resolve refs and record extra information to make rendering easier
    _headersDidChange: function() {
        var headers = this.get('_headers');
        if (!Ember.isNone(headers)) {
            var data = [];
            this.set('dirtyCells', []);

            // fill this.data with nulls, will be fetched lazily later
            var rowLength = this.get('rowLeafs').length;
            var columnLength = this.get('columnLeafs').length;
            for (var i = 0; i < rowLength; i++) {
                data.push([]);
                for (var j = 0; j < columnLength; j++) {
                    data[i].push(null);
                }
            }
            this.set('_data', data);
        }
    }.observes('_headers')
});

})();
(function() {
'use strict';



/*
  A helper class that accepts the table data as a two-dimensional array (array of rows, where
  each row is an array of cell values for that row). Example:

  Flame.TableView.extend({
      content: Flame.DataTableController.create({
          headers: {
              columnHeaders: [{label: 'Col1'}, {label: 'Col2'}],
              rowHeaders: [{label: 'Row1'}, {label: 'Row2'}, {label: 'Row3'}]
          },
          data: [
              ['cell1', 'cell2'],
              ['cell3', 'cell4'],
              ['cell5', 'cell6']
          ]
      })
  })

  If you need a bit of customization, you can override properties 'headerClass' and 'cellClass'.
  Also have a look at ArrayTableController.
 */

Flame.DataTableController = Flame.TableController.extend({
    headers: null,
    data: null,

    init: function() {
        this._super();
        this._headersDidChange();
    },

    _headers: function() {
        var headers = this.get('headers');
        return {
            rowHeaders: this._wrapHeaders(headers.rowHeaders || []),
            columnHeaders: this._wrapHeaders(headers.columnHeaders || [])
        };
    }.property('headers'),

    _wrapHeaders: function(headers) {
        var self = this;
        var headerClass = this.get('headerClass');
        return headers.map(function(header, i) {
            var wrapped = headerClass.create({id: i}, header);
            var children = wrapped.get('children');
            if (children) {
                wrapped.set('children', self._wrapHeaders(children));
            }
            return wrapped;
        });
    },

    headerClass: function() {
        var cellClass = this.get('cellClass');
        return Flame.TableHeader.extend({
            createCell: function(cellData) {
                return new cellClass({value: cellData.value});
            }
        });
    }.property(),

    cellClass: Flame.TableCell,

    _transformData: function(data) {
        var flatData = [];
        data.forEach(function(row, i) {
            row.forEach(function(cellValue, j) {
                flatData.push({ path: {row: [i], column: [j]}, value: cellValue });
            });
        });
        return flatData;
    },

    _headersDidChange: function() {
        this._super();
        var data = this.get('data');
        if (data) {
            // We push all the data in one batch as we don't need to go fetching it from anywhere
            this.pushDataBatch(this._transformData(data));
        }
    }.observes('headers')

});

})();
(function() {
'use strict';




Flame.ArrayTableController = Flame.DataTableController.extend(Flame.TableSortSupport, {
    content: [],  // Set to an array of objects to display (rows)
    columns: [],  // Set to an array of labels+properties to display for each object (columns)
                  // e.g. {property: 'firstName', label: 'First Name'}

    headerProperty: null,  // What to display on the (row) headers
    rowHeadersClickable: false,

    init: function() {
        this._super();
        this._setContentObserver(); // set content observer for initially given content array
    },

    headers: function() {
        var headerProperty = this.get('headerProperty');

        var rowHeadersClickable = this.get('rowHeadersClickable');
        var self = this;
        return {
            rowHeaders: this.get('content').map(function(object, i) {
                // headers won't update in-place, have to force rerender via observer
                var originalValue = object.get(headerProperty);
                var observerMethod = (function() {
                    return function(sender, key, value) {
                        // relies on ArrayTableController#headers being recreated when headers change
                        if (value !== originalValue) {
                            self.refreshHeaders();
                        }
                    };
                })();
                self._setPropertyObserver(object, headerProperty, observerMethod);
                return {
                    isClickable: rowHeadersClickable,
                    label: object.get(headerProperty),
                    object: object
                };
            }),
            columnHeaders: this.get('columns').map(function(column, i) {
                return { label: Ember.get(column, 'label'), property: Ember.get(column, 'property') };
            })
        };
    }.property('content.[]', 'columns', 'headerProperty', 'rowHeadersClickable'),

    data: function() {
        var self = this;
        var columns = this.get('columns');
        return this.get('content').map(function(object, i) {
            return columns.map(function(column, j) {
                // add observer for in-place cell refreshing
                var propertyName = Ember.get(column, 'property');
                var observerMethod = (function() {
                    var propertyName = Ember.get(column, 'property');
                    return function(sender, key, value) {
                        self.pushDataBatch([{path: {row: [i], column: [j]}, value: sender.get(propertyName)}]);
                    };
                })();
                self._setPropertyObserver(object, propertyName, observerMethod);

                return Ember.get(object, Ember.get(column, 'property'));
            });
        });
    }.property('headers'),

    _setPropertyObserver: function(object, propertyName, observerMethod) {
        var observerName = propertyName + "DidChangeInArrayTableController"; // extra suffix for avoiding name conflicts
        object.removeObserver(propertyName, object, observerName);
        object[observerName] = observerMethod;
        object.addObserver(propertyName, object, observerName);
    },

    // Removes all observers that were added via _setPropertyObserver.
    _removePropertyObservers: function(object) {
        var observerRegex = /(.+)DidChangeInArrayTableController$/;
        for (var objProperty in object) {
            if (object.hasOwnProperty(objProperty)) {
                if (observerRegex.test(objProperty)) {
                    var propertyName = observerRegex.exec(objProperty)[1];
                    object.removeObserver(propertyName, object, objProperty);
                    delete object[objProperty];
                }
            }
        }
    },

    // remove observers from objects that were removed from content array
    _contentArrayWillChange: function(content, start, removed, added) {
        var lim = start + removed;
        for (var i = start; i < lim; i++) {
            this._removePropertyObservers(content.objectAt(i));
        }
    },

    _setContentObserver: function() {
        var content = this.get('content');
        if (content) {
            content.addArrayObserver(this, {
                willChange: '_contentArrayWillChange',
                didChange: Ember.K
            });
        }
    }.observes('content'),

    _removeContentObserver: function() {
        var content = this.get('content');
        if (content) {
            content.removeArrayObserver(this, {
                willChange: '_contentArrayWillChange',
                didChange: Ember.K
            });
            // have to remove observers from the old array's objects as well
            content.forEach(this._removePropertyObservers, this);
        }
    }.observesBefore('content'),

    sortContent: function(sortDescriptor) {
        var property = sortDescriptor.header.get('property');
        var orderFactor = sortDescriptor.order === 'desc' ? -1 : 1;

        // Directly sorting the array bypasses all observers, better make a copy, sort that & set back
        var contentCopy = this.get('content').slice();
        contentCopy.sort(function(o1, o2) {
            return orderFactor * Ember.compare(Ember.get(o1, property), Ember.get(o2, property));
        });
        this.set('content', contentCopy);
    },

    refreshHeaders: function() {
        this.propertyWillChange('headers');
        this.propertyDidChange('headers');
    }
});

})();
(function() {
'use strict';

/**
  Support for firing an action, given a target, action and an optional payload. Any of those
  can naturally be defined with a binding. Furthermore, if target is a path the resolves to
  a string, that string is again resolved as a path, etc. until it resolved on non-string.
  For example, target could be 'parentView.controller', which could resolve to
  'MyApp.fooController', which would then resolve to a controller object. If target is not
  defined, it defaults to the view itself.

  Action can be defined as a string or a function. If it's a function, it's called with the
  target bound to 'this'.

  If payload is not defined, it defaults to the view itself.
*/

Flame.ActionSupport = {
    target: null,
    action: null,
    payload: null,

    fireAction: function(action, payload) {
        var target = this.get('target') || this;
        this.beforeAction(this);

        while (typeof target === 'string') {  // Use a while loop: the target can be a path gives another path
            if (target.charAt(0) === '.') {
                target = this.get(target.slice(1));  // If starts with a dot, interpret relative to this view
            } else {
                target = Ember.get(target);
            }
        }
        if (action === undefined) action = this.get('action');

        if (action) {
            var actionFunction = typeof action === 'function' ? action : Ember.get(target, action);
            if (!actionFunction) throw new Error('Target %@ does not have action %@'.fmt(target, action));
            var self = this;
            var actualPayload = !Ember.isNone(payload) ? payload : this.get('payload');
            if (Ember.isNone(actualPayload)) actualPayload = self;
            var afterActionCallback = function() {
                self.afterAction(self);
            };
            return actionFunction.call(target, actualPayload, action, this, afterActionCallback);
        }

        return false;
    },

    beforeAction: function(view) {},
    afterAction: function(view) {}
};

})();
(function() {
'use strict';

var eventHandlers = {
    interpretKeyEvents: function(event) {
        var mapping = event.shiftKey ? Flame.MODIFIED_KEY_BINDINGS : Flame.KEY_BINDINGS;
        var eventName = mapping[event.keyCode];
        if (eventName && this[eventName]) {
            var handler = this[eventName];
            if (Ember.typeOf(handler) === 'function') {
                return handler.call(this, event, this);
            }
        }
        return false;
    },

    handleKeyEvent: function(event, view) {
        var emberEvent = null;
        switch (event.type) {
            case 'keydown':
                emberEvent = 'keyDown';
                break;
            case 'keypress':
                emberEvent = 'keyPress';
                break;
        }
        var handler = emberEvent ? this.get(emberEvent) : null;
        if (handler) {
            // Note that in jQuery, the contract is that event handler should return
            // true to allow default handling, false to prevent it. But in Ember, event handlers return true if they handled the event,
            // false if they didn't, so we want to invert that return value here.
            return !handler.call(Flame.keyResponderStack.current(), event, Flame.keyResponderStack.current());
        }
        return this._handleKeyEvent(emberEvent, event, view);
    },

    _handleKeyEvent: function(eventName, event, view) {
        if (eventName === 'keyDown') { // Try to hand down the event to a more specific key event handler
            var result = this.interpretKeyEvents(event);
            if (result === Flame.ALLOW_BROWSER_DEFAULT_HANDLING) return true;
            if (result) return false;
        }
        if (this.get('parentView')) {
            return this.get('parentView').handleKeyEvent(event, view);
        }
        return true;
    }
};

Ember.View.reopen(eventHandlers);
Ember.TextSupport.reopen(eventHandlers);

Flame.KEY_BINDINGS = {
    8: 'deleteBackward',
    9: 'insertTab',
    13: 'insertNewline',
    27: 'cancel',
    32: 'insertSpace',
    37: 'moveLeft',
    38: 'moveUp',
    39: 'moveRight',
    40: 'moveDown',
    46: 'deleteForward'
};

Flame.MODIFIED_KEY_BINDINGS = {
    8: 'deleteForward',
    9: 'insertBacktab',
    37: 'moveLeftAndModifySelection',
    38: 'moveUpAndModifySelection',
    39: 'moveRightAndModifySelection',
    40: 'moveDownAndModifySelection'
};

// See Flame.TextFieldView for details on what this is needed for
Flame.ALLOW_BROWSER_DEFAULT_HANDLING = {};  // Just a marker value

Ember.mixin(Flame, {
    mouseResponderView: undefined, // Which view handled the last mouseDown event?

    /*
      Holds a stack of key responder views. With this we can neatly handle restoring the previous key responder
      when some modal UI element is closed. There's a few simple rules that governs the usage of the stack:
       - mouse click does .replace (this should also be used for programmatically taking focus when not a modal element)
       - opening a modal UI element does .push
       - closing a modal element does .pop

      Also noteworthy is that a view will be signaled that it loses the key focus only when it's popped off the
      stack, not when something is pushed on top. The idea is that when a modal UI element is opened, we know
      that the previously focused view will re-gain the focus as soon as the modal element is closed. So if the
      previously focused view was e.g. in the middle of some edit operation, it shouldn't cancel that operation.
    */
    keyResponderStack: Ember.Object.createWithMixins({
        _stack: [],

        // Observer-friendly version of getting current
        currentKeyResponder: function() {
            return this.current();
        }.property().volatile(),

        current: function() {
            var length = this._stack.get('length');
            if (length > 0) return this._stack.objectAt(length - 1);
            else return undefined;
        },

        push: function(view) {
            if (!Ember.isNone(view)) {
                if (view.willBecomeKeyResponder) view.willBecomeKeyResponder();
                if (view.set && !view.isDestroyed) view.set('isFocused', true);
                this._stack.push(view);
                if (view.didBecomeKeyResponder) view.didBecomeKeyResponder();
                this.propertyDidChange('currentKeyResponder');
            }
            return view;
        },

        pop: function() {
            if (this._stack.get('length') > 0) {
                var current = this.current();
                if (current && current.willLoseKeyResponder) current.willLoseKeyResponder();  // Call before popping, could make a difference
                var view = this._stack.pop();
                if (view.set && !view.isDestroyed) view.set('isFocused', false);
                if (view.didLoseKeyResponder) view.didLoseKeyResponder();
                this.propertyDidChange('currentKeyResponder');
                return view;
            }
            else return undefined;
        },

        replace: function(view) {
            if (this.current() !== view) {
                this.pop();
                return this.push(view);
            }
        }
    })
});

// Set up a handler on the document for key events.
Ember.$(document).on('keydown.flame keypress.flame', null, function(event, triggeringManager) {
    if (Flame.keyResponderStack.current() !== undefined && Flame.keyResponderStack.current().get('isVisible')) {
        return Flame.keyResponderStack.current().handleKeyEvent(event, Flame.keyResponderStack.current());
    }
    return true;
});

// Handle mouseUp outside of the window
Ember.$(window).on('mouseup', function(event) {
    var mouseResponderView = Flame.get('mouseResponderView');
    if (mouseResponderView !== undefined) {
        // Something (e.g. AJAX callback) may remove the responderView from DOM between mouseDown
        // and mouseUp. In that case return true to ignore the event.
        if (mouseResponderView.get('_state') !== 'inDOM') return true;

        Flame.set('mouseResponderView', undefined);
        return !mouseResponderView.get('eventManager')._dispatch('mouseUp', event, mouseResponderView);
    }
});

// This logic is needed so that the view that handled mouseDown will receive mouseMoves and the eventual mouseUp, even if the
// pointer no longer is on top of that view. Without this, you get inconsistencies with buttons and all controls that handle
// mouse click events. The ember event dispatcher always first looks up 'eventManager' property on the view that's
// receiving an event, and lets that handle the event, if defined. So this should be mixed in to all the Flame views.
Flame.EventManager = {
    // Set to true in your view if you want to accept key responder status (which is needed for handling key events)
    acceptsKeyResponder: false,

    /**
      Sets this view as the target of key events. Call this if you need to make this happen programmatically.
      This gets also called on mouseDown if the view handles that, returns true and doesn't have property 'acceptsKeyResponder'
      set to false. If mouseDown returned true but 'acceptsKeyResponder' is false, this call is propagated to the parent view.

      If called with no parameters or with replace = true, the current key responder is first popped off the stack and this
      view is then pushed. See comments for Flame.keyResponderStack above for more insight.
    */
    becomeKeyResponder: function(replace) {
        if (this.get('acceptsKeyResponder') !== false && !this.get('isDisabled')) {
            if (replace === undefined || replace === true) {
                Flame.keyResponderStack.replace(this);
            } else {
                Flame.keyResponderStack.push(this);
            }
        } else {
            var parent = this.get('parentView');
            if (parent && parent.becomeKeyResponder) return parent.becomeKeyResponder(replace);
        }
    },

    /**
      Resign key responder status by popping the head off the stack. The head might or might not be this view,
      depending on whether user clicked anything since this view became the key responder. The new key responder
      will be the next view in the stack, if any.
    */
    resignKeyResponder: function() {
        Flame.keyResponderStack.pop();
    },

    eventManager: {
        mouseDown: function(event, view) {
            view.becomeKeyResponder();  // Becoming a key responder is independent of mouseDown handling
            Flame.set('mouseResponderView', undefined);
            var handlingView = this._dispatch('mouseDown', event, view);
            if (handlingView) {
                Flame.set('mouseResponderView', handlingView);
            }
            return !handlingView;
        },

        mouseUp: function(event, view) {
            var mouseResponderView = Flame.get('mouseResponderView');
            if (mouseResponderView !== undefined) {
                // Something (e.g. AJAX callback) may remove the responderView from DOM between mouseDown
                // and mouseUp. In that case return true to ignore the event.
                if (mouseResponderView.get('_state') !== 'inDOM') return true;

                view = mouseResponderView;
                Flame.set('mouseResponderView', undefined);
            }
            return !this._dispatch('mouseUp', event, view);
        },

        mouseMove: function(event, view) {
            var mouseResponderView = Flame.get('mouseResponderView');
            if (mouseResponderView !== undefined) {
                // Something (e.g. AJAX callback) may remove the responderView from DOM between mouseDown
                // and/or mouseMove. In that case return true to ignore the event.
                if (mouseResponderView.get('_state') !== 'inDOM') return true;

                view = mouseResponderView;
            }
            return !this._dispatch('mouseMove', event, view);
        },

        doubleClick: function(event, view) {
            if (Flame.get('mouseResponderView') !== undefined) {
                view = Flame.get('mouseResponderView');
            }
            return !this._dispatch('doubleClick', event, view);
        },

        keyDown: function(event) {
            if (Flame.keyResponderStack.current() !== undefined && Flame.keyResponderStack.current().get('isVisible')) {
                return Flame.keyResponderStack.current().handleKeyEvent(event, Flame.keyResponderStack.current());
            }
            return true;
        },

        keyPress: function(event) {
            if (Flame.keyResponderStack.current() !== undefined && Flame.keyResponderStack.current().get('isVisible')) {
                return Flame.keyResponderStack.current().handleKeyEvent(event, Flame.keyResponderStack.current());
            }
            return true;
        },

        // For the passed in view, calls the method with the name of the event, if defined. If that method
        // returns true, returns the view. If the method returns false, recurses on the parent view. If no
        // view handles the event, returns false.
        _dispatch: function(eventName, event, view) {
            var handler = view.get(eventName);
            if (handler) {
                var result = handler.call(view, event, view);
                if (result === Flame.ALLOW_BROWSER_DEFAULT_HANDLING) return false;
                else if (result) return view;
            }
            var parentView = view.get('parentView');
            if (parentView) return this._dispatch(eventName, event, parentView);
            else return false;
        }
    }
};

})();
(function() {
'use strict';

Flame.FocusSupport = {
    // To make text fields/areas behave consistently with our concept of key responder, we have to also
    // tell the browser to focus/blur the input field
    didBecomeKeyResponder: function() {
        var $element = this.$();
        if ($element) $element.focus();
    },

    didLoseKeyResponder: function() {
        var $element = this.$();
        if ($element) $element.blur();
    },

    focusIn: function() {
        if (Flame.keyResponderStack.current() !== this) {
            this.becomeKeyResponder();
        }
    },

    focusOut: function() {
        if (Flame.keyResponderStack.current() === this) {
            // If focus was lost from the document, keep the "local" focus intact
            if (document.hasFocus()) this.resignKeyResponder();
        }
    }
};

})();
(function() {
'use strict';

/**
  Support for defining the layout with a hash, e.g. layout: { left: 10, top: 10, width: 100, height: 30 }
*/

Flame.LayoutSupport = {
    useAbsolutePosition: true,
    layout: { left: 0, right: 0, top: 0, bottom: 0 },
    defaultWidth: undefined,
    defaultHeight: undefined,
    layoutManager: undefined,

    _layoutProperties: ['left', 'right', 'top', 'bottom', 'width', 'height', 'maxHeight'],
    _cssProperties: ['left', 'right', 'top', 'bottom', 'width', 'height', 'margin-left', 'margin-top', 'overflow'],
    _layoutChangeInProgress: false,
    _layoutSupportInitialized: false,
    _layoutObservers: null,

    init: function() {
        if (this.useAbsolutePosition) {
            this.classNames = this.get('classNames').concat(['flame-view']);
        }
        this._super();
        this._initLayoutSupport();
        this.consultLayoutManager();
        this.updateLayout();  // Make sure CSS is up-to-date, otherwise can sometimes get out of sync for some reason
    },

    willDestroy: function() {
        this._super();
        if (this._layoutObservers) {
            var length = this._layoutObservers.length;
            for (var i = 0; i < length; i++) {
                this.removeObserver(this._layoutObservers[i]);
            }
        }
    },

    // When using handlebars templates, the child views are created only upon rendering, not in init.
    // Thus we need to consult the layout manager also at this point.
    didInsertElement: function() {
        this._super();
        this.consultLayoutManager();
    },

    beforeRender: function(buffer) {
        this._renderElementAttributes(buffer);
        this._super(buffer);
    },

    childViewsDidChange: function() {
        this._super.apply(this, arguments);
        this.consultLayoutManager();
    },

    _initLayoutSupport: function() {
        // Do this initialization even if element is not currently using absolute positioning, just in case
        var layout = Ember.Object.create(this.get('layout')); // Clone layout for each instance in case it's mutated (happens with split view)

        if (layout.width === undefined && layout.right === undefined && this.get('defaultWidth') !== undefined) {
            layout.width = this.get('defaultWidth');
        }
        if (layout.height === undefined && (layout.top === undefined || layout.bottom === undefined) && this.get('defaultHeight') !== undefined) {
            layout.height = this.get('defaultHeight');
        }

        this.set('layout', layout);

        this._layoutSupportInitialized = true;
    },

    _renderElementAttributes: function(buffer) {

        if (!this.get('useAbsolutePosition')) return;

        var layout = this.get('layout') || {};
        this._resolveLayoutBindings(layout);
        this._translateLayout(layout, buffer);

        if (layout.zIndex !== undefined) buffer.style('z-index', layout.zIndex);

        var backgroundColor = this.get('backgroundColor');
        if (backgroundColor !== undefined) buffer.style('background-color', backgroundColor);
    },

    _resolveLayoutBindings: function(layout) {
        if (layout._bindingsResolved) return; // Only add the observers once, even if rerendered
        var observer = function(prop, value) {
            return function() {
                this.adjustLayout(prop, this.get(value));
            };
        };
        this._layoutObservers = [];
        var length = this._layoutProperties.length;
        for (var i = 0; i < length; i++) {
            var prop = this._layoutProperties[i];
            var value = layout[prop];
            // Does it look like a property path (and not e.g. '50%')?
            if (typeof value === 'string' && value !== '' && isNaN(parseInt(value, 10))) {
                this.addObserver(value, this, observer(prop, value));
                // Keep track of the observers we add so they can be removed later
                this._layoutObservers.push(value);
                layout[prop] = this.get(value);
            }
        }
        layout._bindingsResolved = true;
    },

    // Given a layout hash, translates possible centerX and centerY to appropriate CSS properties.
    // If a buffer is given, renders the CSS styles to that buffer.
    _translateLayout: function(layout, buffer) {
        var cssLayout = {};

        if (layout.maxHeight !== undefined) {
            cssLayout.overflow = 'auto';
        }

        if (layout.overflow) {
            cssLayout.overflow = layout.overflow;
        }

        cssLayout.width = layout.width;
        if (layout.centerX === undefined) {
            cssLayout.left = layout.left;
            cssLayout.right = layout.right;
        } else {
            cssLayout.left = '50%';
            cssLayout['margin-left'] = (-((layout.width || 0) / 2) + layout.centerX) + 'px';
        }

        cssLayout.height = layout.height;
        if (layout.centerY === undefined) {
            cssLayout.top = layout.top;
            cssLayout.bottom = layout.bottom;
        } else {
            cssLayout.top = '50%';
            cssLayout['margin-top'] = (-((layout.height || 0) / 2) + layout.centerY) + 'px';
        }

        var i, length = this._cssProperties.length;
        for (i = 0; i < length; i++) {
            var prop = this._cssProperties[i];
            var value = cssLayout[prop];
            // If a number or a string containing only a number, append 'px'
            if (value !== undefined && (typeof value === 'number' || parseInt(value, 10).toString() === value)) {
                cssLayout[prop] = value += 'px';
            }

            if (buffer && !Ember.isNone(value)) {
                buffer.style(prop, value);
            }
        }

        return cssLayout;
    },

    // If layout manager is defined, asks it to recompute the layout, i.e. update the positions of the child views
    consultLayoutManager: function() {
        // View initializations might result in calling this method before they've called our init method.
        // That causes very bad effects because the layout property has not yet been cloned, which means
        // that several views might be sharing the layout property. So just ignore the call if not initialized.
        if (!this._layoutSupportInitialized) return;

        var layoutManager = this.get('layoutManager');
        if (!layoutManager) return;

        // This is needed to prevent endless loop as the layout manager is likely to update the children, causing this method to be called again
        if (!this._layoutChangeInProgress) {
            this._layoutChangeInProgress = true;
            layoutManager.setupLayout(this);
            this._layoutChangeInProgress = false;
        }
    },

    layoutDidChangeFor: function(childView) {
        this.consultLayoutManager();
    },

    // Can be used to adjust one property in the layout. Updates the DOM automatically.
    adjustLayout: function(property, value, increment) {


        var layout = this.get('layout');
        var oldValue = layout[property];
        var newValue;
        if (value !== undefined) {
            newValue = value;
        } else if (increment !== undefined) {
            newValue = oldValue + increment;
        } else {
            throw new Error('Give either a new value or an increment!');
        }

        if (oldValue !== newValue) {
            layout[property] = newValue;
            this.updateLayout();
            if (property === 'maxHeight') {
                this.consultLayoutManager();
            }
        }
    },

    // Call this method to update the DOM to reflect the layout property, without recreating the DOM element
    updateLayout: function() {


        if (this.get('useAbsolutePosition')) {
            var cssLayout = this._translateLayout(this.get('layout') || {});
            var element = this.get('element');
            if (element) {
                jQuery(element).css(cssLayout);
            } else {
                // Apparently not yet in DOM - should be fine though, we update the layout in didInsertElement
            }
        }

        var parentView = this.get('parentView');
        if (parentView && parentView.layoutDidChangeFor) parentView.layoutDidChangeFor(this);
    }.observes('isVisible', 'layout'),

    // XXX: isVisible property doesn't seem to always get set properly, so make sure it is true
    isVisible: true
};

})();
(function() {
'use strict';

Flame.ViewSupport = {
    concatenatedProperties: ['displayProperties'],
    displayProperties: [],
    resetClassNames: false,

    init: function() {
        this._super();

        // Add observers for displayProperties so that the view gets rerendered if any of them changes
        var properties = this.get('displayProperties') || [];
        var length = properties.length;
        for (var i = 0; i < length; i++) {
            var property = properties[i];
            this.addObserver(property, this, this.rerender);
        }

        // Remove classNames up to Flame.View to make it easier to define custom
        // styles for buttons, checkboxes etc...
        // We only want to do this in the init of class that sets the flag
        if (this.get('resetClassNames') && Object.getPrototypeOf) {
            var superClassNames = this._collectSuperClassNames();
            var classNames = this.get('classNames').removeObjects(superClassNames);
            this.set('classNames', classNames);
        }
    },

    willDestroy: function() {
        this._super();
        var properties = this.get('displayProperties') || [];
        var length = properties.length;
        for (var i = 0; i < length; i++) {
            this.removeObserver(properties[i]);
        }
    },

    createChildView: function(view, attrs) {
        view = this._super(view, attrs);
        if (view instanceof Ember.View && Flame._bindPrefixedBindings(view)) {
            Ember.finishChains(view);
        }
        return view;
    },

    /**
      Collects the classNames that were defined in super classes, but not
      classNames in Flame.View or superclasses that are above it in the
      class hierarchy.
    */
    _collectSuperClassNames: function() {
        var superClassNames = [];
        var superClass = Object.getPrototypeOf(Object.getPrototypeOf(this));
        while (superClass && superClass.constructor !== Flame.View) {
            superClassNames.pushObjects(superClass.classNames || []);
            superClass = Object.getPrototypeOf(superClass);
        }
        // Add back the classNames from Flame.View and deeper
        if (superClass.constructor === Flame.View) {
            superClassNames.removeObjects(superClass.classNames);
        }
        return superClassNames;
    }
};

})();
(function() {
'use strict';




/**
  Layout managers are helpers that you can delegate setting the layout properties to when you get
  tired of doing it manually. They can also update the layout on the fly by reacting to changes
  in the layout of child views.
*/

Flame.LayoutManager = Ember.Object.extend({
    setupLayout: undefined
});

})();
(function() {
'use strict';

/**
  VerticalStackLayoutManager is a layout manager that stacks the children vertically, with optional
  top margin, spacing and bottom margin. Use in your view e.g. like this;

   layout: { right: 220, top: 60, width: 200 },
   layoutManager: Flame.VerticalStackLayoutManager.create({ spacing: 10 }),

  Each child view should define layout.height. For the parent view it's set automatically. Should any
  of the child views change their height, the layout is updated automatically. If a childView has
  property 'ignoreLayoutManager' set to true, its layout is not affected nor considered here.
  Similarly, elements with isVisible false are ignored.

  TODO: make ignoreLayoutManager handling more generic if/when more layout managers are implemented
*/

Flame.VerticalStackLayoutManager = Flame.LayoutManager.extend({
    topMargin: 0,
    bottomMargin: 0,
    spacing: 0,

    setupLayout: function(view) {
        var top = this.get('topMargin');
        var fluid = false;
        var maxHeight = view.get('layout.maxHeight');

        // Filter out views that are not affected by the layout manager
        var views = view.toArray().filter(function(childView) {
            return childView.get('ignoreLayoutManager') !== true &&
                (childView.get('isVisible') || childView.get('isVisible') === null) && // isVisible is initially null
                childView.get('layout');
        });

        var length = views.get('length');
        views.forEach(function(childView, i) {


            if (i > 0) top += this.get('spacing');

            var layout = childView.get('layout');
            childView._resolveLayoutBindings(layout); // XXX ugly

            top += (layout.topMargin || 0);
            childView.adjustLayout('top', top); // Use adjustLayout, it checks if the property changes (can trigger a series of layout updates)
            top += (layout.topPadding || 0) + (layout.bottomPadding || 0);  // if view has borders, these can be used to compensate

            var height = layout.height;
            if (typeof height === 'string') height = parseInt(height, 10);
            if (i < length - 1) { // XXX should not check the index, this check should only consider visible child views

            }

            if (Ember.isNone(layout.height)) {
                fluid = true;
            } else {
                top += height;
            }
        }, this);

        // fluid == true means that the last child has no height set, meaning that it's meant to fill in the rest of the parent's view.
        // In that case, we must not set parent's height either, because the system is supposed to remain fluid (i.e. bottom is set).
        if (!fluid) {
            top += this.get('bottomMargin');
        }
        if (maxHeight !== undefined && top > maxHeight) {
            top = maxHeight;
        }
        if (!fluid || maxHeight !== undefined) {
            view.adjustLayout('height', top);
        }
    }
});

})();
(function() {
'use strict';






Ember.View.reopen({
    // Finds the first descendant view for which given property evaluates to true. Proceeds depth-first.
    firstDescendantWithProperty: function(property) {
        var result;
        this.forEachChildView(function(childView) {
            if (!(childView instanceof Ember.View)) return;
            if (result === undefined) {
                if (childView.get(property)) {
                    result = childView;
                } else {
                    result = childView.firstDescendantWithProperty(property);
                }
            }
        });
        return result;
    }
});

Flame.reopen({
    ALIGN_LEFT: 'align-left',
    ALIGN_RIGHT: 'align-right',
    ALIGN_CENTER: 'align-center',

    FOCUS_RING_MARGIN: 3
});

/**
  Base class for Flame views. Can be used to hold child views or render a template. In Ember, you normally either use
  Ember.View for rendering a template or Ember.ContainerView to render child views. But we want to support both here, so
  that we can use e.g. Flame.ListItemView for items in list views, and the app can decide whether to use a template or not.
*/
Flame.View = Ember.ContainerView.extend(Flame.ViewSupport, Flame.LayoutSupport, Flame.EventManager, {
    isFocused: false, // Does this view currently have key focus?

    init: function() {
        // Adds support for conditionally rendering child views, e.g.:
        //   childViews: ['labelView', 'hasButton:buttonView']
        // will only render the buttonView if this.get('hasButton') is true.
        var childViews = this.get('childViews');
        if (!childViews) {
            this._super();
            return;
        }
        var length = childViews.length;
        var removedCount = 0;
        var childViewsToCreate;
        for (var i = 0; i < length; i++) {
            var childView = childViews[i];
            if (childView.indexOf(':') > -1) {
                childViewsToCreate = childViewsToCreate || childViews.slice(0);
                var split = childView.split(':');
                if (this.get(split[0])) {
                    childViewsToCreate[i - removedCount] = split[1];
                } else {
                    childViewsToCreate.splice(i - removedCount, 1);
                    removedCount++;
                }
            }
        }
        if (childViewsToCreate) this.set('childViews', childViewsToCreate);

        this._super();
    },

    render: function(buffer) {
        // If a template is defined, render that, otherwise use ContainerView's rendering (render childViews)
        var get = Ember.get;
        var template = this.get('template');
        if (template) {
            // TODO should just call Ember.View.prototype.render.call(this, buffer) here (for that we need to rename `layout` to something else first)
            var context = get(this, 'context');
            var keywords = this.cloneKeywords();
            var output;

            var data = {
                view: this,
                buffer: buffer,
                isRenderData: true,
                keywords: keywords,
                insideGroup: get(this, 'templateData.insideGroup')
            };

            // Invoke the template with the provided template context, which
            // is the view's controller by default. A hash of data is also passed that provides
            // the template with access to the view and render buffer.

            // The template should write directly to the render buffer instead
            // of returning a string.
            output = template(context, { data: data });

            // If the template returned a string instead of writing to the buffer,
            // push the string onto the buffer.
            if (output !== undefined) { buffer.push(output); }
        } else {
            this._super(buffer);
        }
    },

    // For Ember 1.0, removeChild on ContainerViews expects there not to be any SimpleHandlebarsView children
    // Flame.View extends ContainerView, but it allows templates, so there will be SimpleHandlebarsViews children.
    // This is the Ember.View implementation of removeChild for when there is a template.
    removeChild: function(view) {
        if (this.get('template')) {
            // there is a template - use Ember.View's `removeChild`
            return Ember.View.prototype.removeChild.call(this, view);
        } else {
            // no template - use Ember.ContainerView's `removeChild`
            return this._super(view);
        }
    },

    template: function() {
        var handlebarsStr = this.get('handlebars');
        if (handlebarsStr) return this._compileTemplate(handlebarsStr);

        var templateName = this.get('templateName'),
            template = this.templateForName(templateName, 'template');
        return template || null;
    }.property('templateName', 'handlebars'),

    // Compiles given handlebars template, with caching to make it perform better. (Called repetitively e.g.
    // when rendering a list view whose item views use a template.)
    _compileTemplate: function(template) {
        var compiled = Flame._templateCache[template];
        if (!compiled) {
            Flame._templateCache[template] = compiled = Ember.Handlebars.compile(template);
        }
        return compiled;
    }
});

Flame._templateCache = {};

})();
(function() {
'use strict';

Flame.ImageView = Flame.View.extend({
    handlebars: '<img {{bind-attr src="view.value"}}>'
});

})();
(function() {
'use strict';

Flame.LabelView = Flame.View.extend(Flame.ActionSupport, {
    layout: { left: 0, top: 0 },
    classNames: ['flame-label-view'],
    classNameBindings: ['textAlign', 'isSelectable', 'isDisabled'],
    defaultHeight: 22,
    defaultWidth: 200,
    isSelectable: false,
    isDisabled: false,
    allowWrapping: false,

    handlebars: '{{view.value}}',

    beforeRender: function(buffer) {
        var height = this.get('layout.height');
        if (this.get('useAbsolutePosition') &&
            !Ember.isNone(height) &&
            !this.get('allowWrapping')) {
            buffer.style('line-height', height + 'px');
        }
        this._super(buffer);
    },

    mouseDown: function(event) {
        return this.fireAction();
    },

    // We should never let mouseUp propagate. If we handled mouseDown, we will receive mouseUp and obviously
    // it shouldn't be propagated. If we didn't handle mouseDown (there was no action), it was propagated up
    // and the mouse responder logic will relay mouseUp directly to the view that handler mouseDown.
    mouseUp: function(event) {
        return true;
    },

    // Apply the same logic to touchStart and touchEnd
    touchStart: function(event) {
        return this.fireAction();
    },
    touchEnd: function(event) {
        return true;
    }
});

Flame.LabelView.reopenClass({
    // Shortcut for creating label views with a static label
    label: function(value, left, top, width, height) {
        return Flame.LabelView.extend({
            layout: { left: left, top: top, width: width, height: height },
            value: value
        });
    }
});

})();
(function() {
'use strict';



// When multiple panels with modal panes are shown at the same time, we need this to get them to stack on
// top of each other. If they use a static z-index, all the panels would appear on top of all the modal panes.
Flame._zIndexCounter = 100;

Flame.reopen({
    POSITION_BELOW:  1 << 0,
    POSITION_RIGHT:  1 << 1,
    POSITION_LEFT:   1 << 2,
    POSITION_ABOVE:  1 << 3,
    POSITION_MIDDLE: 1 << 4
});

// A pop-up panel, modal or non-modal. The panel is destroyed on closing by default. If you intend to reuse the same
// panel instance, set destroyOnClose: false.
Flame.Panel = Flame.View.extend({
    classNames: ['flame-panel'],
    childViews: ['titleView', 'contentView', 'resizeView'],
    destroyOnClose: true,
    acceptsKeyResponder: true,
    isModal: true,
    allowClosingByClickingOutside: true,
    allowClosingByCancelButton: false,
    allowMoving: false,
    dimBackground: true,
    title: null,
    isShown: false,
    // make isResizable true to allow panel to be resized by the user
    isResizable: false,
    // Default minimum size for the resized panel
    minHeight: 52,
    minWidth: 100,
    // When given a unique id, the panel's layout (so far only position) will be persisted
    layoutPersistenceKey: null,

    init: function() {

        this._super();
    },

    titleView: Flame.View.extend(Flame.Statechart, {
        layout: { left: 0, right: 0, height: 'height', bottomPadding: 1 },
        classNames: ['flame-panel-title'],
        isVisible: Ember.computed.notEqual('parentView.title', null),
        initialFlameState: 'idle',
        childViews: ['headerView'],

        height: function() {
            return this.get('parentView.headerView.height') || 26;
        }.property('parentView.headerView.height'),

        headerView: function() {
            return this.get('parentView.headerView') || this.get('labelView');
        }.property('parentView.headerView'),

        labelView: Flame.LabelView.extend({
            layout: { left: 4, right: 4, top: 2 },
            textAlign: Flame.ALIGN_CENTER,
            value: Ember.computed.alias('parentView.parentView.title')
        }),

        idle: Flame.State.extend({
            mouseDown: function(event) {
                var owner = this.get('owner');
                if (!owner.get('parentView.allowMoving')) {
                    return true;
                }
                owner._pageX = event.pageX;
                owner._pageY = event.pageY;
                var offset = owner.get('parentView').$().offset();
                owner._panelX = offset.left;
                owner._panelY = offset.top;
                this.gotoFlameState('moving');
                return true;
            },
            touchStart: function(event) {
                // Normalize the event and send it to mouseDown()
                this.mouseDown(this.normalizeTouchEvents(event));
                return true;
            }
        }),

        moving: Flame.State.extend({
            enterState: function() {
                this.element = this.get('owner.parentView').$();
                this.windowHeight = jQuery(window).height();
                this.windowWidth = jQuery(window).width();
                this.elementWidth = this.element.outerWidth();
                this.elementHeight = this.element.outerHeight();
            },
            mouseMove: function(event) {
                var owner = this.get('owner');
                var newX = owner._panelX + (event.pageX - owner._pageX);
                var newY = owner._panelY + (event.pageY - owner._pageY);
                this.newX = Math.max(5, Math.min(newX, this.windowWidth - this.elementWidth - 5));  // Constrain inside window
                this.newY = Math.max(5, Math.min(newY, this.windowHeight - this.elementHeight - 5));
                this.element.css({ left: this.newX, top: this.newY, right: '', bottom: '', marginLeft: '', marginTop: '' });
                return true;
            },
            touchMove: function(event) {
                // Don't scroll the page while doing this
                event.preventDefault();
                // Normalize the event and send it to mouseMove()
                this.mouseMove(this.normalizeTouchEvents(event));
                return true;
            },
            mouseUp: Flame.State.gotoFlameState('idle'),
            touchEnd: Flame.State.gotoFlameState('idle'),
            exitState: function() {
                // Save panel layout
                var layoutPersistenceKey = this.get('owner').nearestOfType(Flame.Panel).get('layoutPersistenceKey');
                if (layoutPersistenceKey) {
                    var panelLayouts = JSON.parse(localStorage.getItem('panelLayouts')) || {};
                    panelLayouts[layoutPersistenceKey] = {
                        position: { left: this.newX, top: this.newY }
                    };
                    localStorage.setItem('panelLayouts', JSON.stringify(panelLayouts));
                }
            }
        })
    }),

    resizeView: Flame.View.extend(Flame.Statechart, {
        layout: { bottom: 3, right: 3, height: 16, width: 16 },
        ignoreLayoutManager: true,
        classNames: ['flame-resize-thumb'],
        isVisible: Ember.computed.alias('parentView.isResizable'),
        initialFlameState: 'idle',
        isResizing: false,

        idle: Flame.State.extend({
            enterState: function(event) {
                this.set('owner.isResizing', false);
            },
            mouseDown: function(event) {
                var owner = this.get('owner');
                var panelElement = owner.get('parentView').$();
                if (!owner.get('parentView.isResizable')) {
                    return true;
                }
                owner._pageX = event.pageX;
                owner._pageY = event.pageY;
                owner._startW = panelElement.outerWidth();
                owner._startH = panelElement.outerHeight();
                this.gotoFlameState('resizing');
                return true;
            },
            touchStart: function(event) {
                // Normalize the event and send it to mouseDown()
                this.mouseDown(this.normalizeTouchEvents(event));
                return true;
            }
        }),
        resizing: Flame.State.extend({
            enterState: function(event) {
                this.set('owner.isResizing', true);
            },
            mouseMove: function(event) {
                var owner = this.get('owner');
                var parentView = owner.get('parentView');
                var newW = owner._startW + (event.pageX - owner._pageX);
                var newH = owner._startH + (event.pageY - owner._pageY);
                newW = Math.max(parentView.get('minWidth'), newW);  // Minimum panel width
                newH = Math.max(parentView.get('minHeight'), newH);  // Minimum panel height: title bar plus this "thumb"
                parentView.$().css({ width: newW, height: newH });
                return true;
            },
            touchMove: function(event) {
                // Don't scroll the page while resizing
                event.preventDefault();
                // Normalize the event and send it to mouseMove()
                this.mouseMove(this.normalizeTouchEvents(event));
                return true;
            },
            mouseUp: Flame.State.gotoFlameState('idle'),
            touchEnd: Flame.State.gotoFlameState('idle')
        })
    }),

    // This is the pane that's used to obscure the background if isModal === true
    modalPane: function() {
        return Flame.View.create({
            layout: { left: 0, top: 0, right: 0, bottom: 0 },
            classNames: ['flame-modal-pane'],
            classNameBindings: ['parentPanel.dimBackground'],

            parentPanel: null,
            mouseDown: function() {
                if (this.get('parentPanel.allowClosingByClickingOutside')) {
                    this.get('parentPanel').close();
                }
                return true;
            },
            touchStart: function() {
                if (this.get('parentPanel.allowClosingByClickingOutside')) {
                    this.get('parentPanel').close();
                }
                return true;
            }
        });
    }.property().volatile(),

    insertNewline: function(event) {
        var defaultButton = this.firstDescendantWithProperty('isDefault');
        if (defaultButton && defaultButton.simulateClick) {
            defaultButton.simulateClick();
        }
        return true;
    },

    cancel: function(event) {
        if (this.get('allowClosingByCancelButton')) {
            this.close();
        }
        return true;
    },

    _getDimensionsForAnchorElement: function(anchorElement) {
        if (anchorElement.closest('svg').length > 0) {
            return { height: anchorElement[0].getBBox().height, width: anchorElement[0].getBBox().width };
        } else {
            return { height: anchorElement.outerHeight(), width: anchorElement.outerWidth() };
        }
    },

    _layoutRelativeTo: function(anchor, position) {
        position = position || Flame.POSITION_BELOW;

        var layout = this.get('layout');
        var anchorElement = anchor instanceof jQuery ? anchor : anchor.$();
        var offset = anchorElement.offset();

        var contentView = this.objectAt(0);
        if (contentView && contentView.get('layout') && contentView.get('layout').height && (!layout || !layout.height)) {
            layout.height = contentView.get('layout').height;
        }

        var dimensions = this._getDimensionsForAnchorElement(anchorElement);

        if (position & (Flame.POSITION_BELOW | Flame.POSITION_ABOVE)) {
            layout.top = offset.top + ((position & Flame.POSITION_BELOW) ? dimensions.height : -layout.height);
            layout.left = offset.left;
            if (position & Flame.POSITION_MIDDLE) {
                layout.left = layout.left - (layout.width / 2) + (dimensions.width / 2);
            }
        } else if (position & (Flame.POSITION_RIGHT | Flame.POSITION_LEFT)) {
            layout.top = offset.top;
            layout.left = offset.left + ((position & Flame.POSITION_RIGHT) ? dimensions.width : -layout.width);
            if (position & Flame.POSITION_MIDDLE) {
                layout.top = layout.top - (layout.height / 2) + (dimensions.height / 2);
            }
        } else {

        }

        // Make sure the panel is still within the viewport horizontally ...
        var $window = Ember.$(window);
        var windowWidth = $window.width();
        if (layout.left + layout.width > windowWidth - 10) {
            layout.left = windowWidth - layout.width - 10;
            layout.movedX = true;
        }
        // ... and vertically
        if ((position & Flame.POSITION_BELOW && (layout.top + layout.height > $window.height() - 10) && offset.top - layout.height >= 0) ||
            (position & Flame.POSITION_ABOVE && (layout.top < 0))) {
            layout.movedY = true;
        } else if (layout.top < 0) {
            layout.top = 10;
        }
        return layout;
    },

    popup: function(anchor, position) {
        if (!this.get('isShown')) {
            if (this.get('isModal')) {
                var modalPane = this.get('modalPane');
                modalPane.set('parentPanel', this);
                modalPane.get('layout').zIndex = Flame._zIndexCounter;
                Ember.run(function() {
                    modalPane.append();
                });
                this.set('_modalPane', modalPane);
            }

            if (anchor) {
                this.set('layout', this._layoutRelativeTo(anchor, position));
            }
            this.get('layout').zIndex = Flame._zIndexCounter + 10;
            Flame._zIndexCounter += 100;

            this.append();
            this.set('isShown', true);
            this.set('isVisible', true);
            if (this.get('acceptsKeyResponder')) this.becomeKeyResponder(false);
            // Try to restore panel layout
            var layoutPersistenceKey = this.get('layoutPersistenceKey');
            if (layoutPersistenceKey) {
                var panelLayouts = JSON.parse(localStorage.getItem('panelLayouts')) || {};
                if (panelLayouts[layoutPersistenceKey]) {
                    var layout = this.get('layout');
                    layout.top = panelLayouts[layoutPersistenceKey].position.top;
                    layout.left = panelLayouts[layoutPersistenceKey].position.left;
                    layout.centerX = undefined;
                    layout.centerY = undefined;
                }
            }
            Ember.run.scheduleOnce('afterRender', this, this._focusDefaultInput);
        }
    },

    close: function() {
        if (this.isDestroyed) return;
        if (this.get('isShown')) {
            if (this.get('isModal')) {
                this.get('_modalPane').remove();
                this.get('_modalPane').destroy();
            }
            this.remove();
            this.set('isShown', false);
            this.set('isVisible', false);
            if (this.get('acceptsKeyResponder')) this.resignKeyResponder();
            Flame._zIndexCounter -= 100;

            if (this.get('destroyOnClose')) this.destroy();
        }
    },

    _focusDefaultInput: function() {
        var defaultFocus = this.firstDescendantWithProperty('isDefaultFocus');
        if (defaultFocus) defaultFocus.becomeKeyResponder();
    }
});

})();
(function() {
'use strict';

Flame.ButtonView = Flame.View.extend(Flame.ActionSupport, Flame.Statechart, {
    defaultHeight: 24,
    classNames: ['flame-button-view'],
    classNameBindings: ['isHovered', 'isActive', 'isSelected', 'isDisabled', 'isDefault', 'isFocused'],
    acceptsKeyResponder: true,
    isHovered: false,
    isActive: false,
    isSelected: false,  // for 'sticky' buttons, means that the button is stuck down (used for tab views)
    isDisabled: false,
    isDefault: false,  // If true, fires in a panel when user hits enter
    isSticky: false,  // If true, each click (mouseUp to be specific) toggles 'isSelected'
    initialFlameState: 'idle',

    handlebars: '<label class="flame-button-label">{{view.title}}</label>',

    beforeRender: function(buffer) {
        var height = this.get('layout.height');
        if (this.get('useAbsolutePosition') &&
            !Ember.isNone(height)) {
            buffer.style('line-height', (height - 2) + 'px'); // -2 to account for borders
        }
        this._super(buffer);
    },

    insertSpace: function(event) {
        this.simulateClick();
        return true;
    },

    idle: Flame.State.extend({
        mouseEnter: function() {
            this.gotoFlameState('hover');
            return true;
        },

        touchStart: function(event) {
            this.gotoFlameState('mouseDownInside');
            return true;
        },

        simulateClick: function() {
            this.gotoFlameState('hover');
            this.get('owner').mouseDown();
            Ember.run.later(this.get('owner'), function() {
                this.mouseUp();
                this.mouseLeave();
            }, 150);
        }
    }),

    hover: Flame.State.extend({
        mouseLeave: function() {
            this.gotoFlameState('idle');
            return true;
        },

        mouseDown: function() {
            if (!this.get('owner.isDisabled')) {
                this.gotoFlameState('mouseDownInside');
            }
            return true;
        },

        simulateClick: function() {
            this.mouseDown();
            Ember.run.later(this.get('owner'), 'mouseUp', 100);
        },

        enterState: function() {
            this.get('owner').set('isHovered', true);
        },

        exitState: function() {
            var owner = this.get('owner');
            // Because the mouseLeave event is executed via Ember.run.later, it can happen that by the time we exitState
            // the owner has been destroyed
            if (!owner.isDestroyed) {
                owner.set('isHovered', false);
            }
        }
    }),

    mouseDownInside: Flame.State.extend({
        _handleClick: function() {
            var owner = this.get('owner');
            owner.fireAction();
            if (owner.get('isSticky')) {
                owner.toggleProperty('isSelected');
            }
        },

        mouseUp: function() {
            this._handleClick();
            this.gotoFlameState('hover');
            return true;
        },

        touchEnd: function(event) {
            this._handleClick();
            this.gotoFlameState('idle');
            return true;
        },

        mouseLeave: function() {
            this.gotoFlameState('mouseDownOutside');
            return true;
        },

        enterState: function() {
            this.get('owner').set('isActive', true);
        },

        exitState: function() {
            this.get('owner').set('isActive', false);
        }
    }),

    mouseDownOutside: Flame.State.extend({
        mouseUp: function() {
            this.gotoFlameState('idle');
            return true;
        },

        mouseEnter: function() {
            this.gotoFlameState('mouseDownInside');
            return true;
        }
    })
});

})();
(function() {
'use strict';






var alias = Ember.computed.alias,
    nearest = Flame.computed.nearest;

Flame.AlertPanel = Flame.Panel.extend();

Flame.AlertPanel.INFO_ICON = Flame.image('info_icon.svg');
Flame.AlertPanel.WARN_ICON = Flame.image('warn_icon.svg');
Flame.AlertPanel.ERROR_ICON = Flame.image('error_icon.svg');

Flame.AlertPanelButtonView = Flame.View.extend({
    layout: { width: '100%', right: 0, height: 30 },
    childViews: ['cancelButtonView', 'confirmButtonView'],
    cancelButtonTitle: 'Cancel',
    confirmButtonTitle: 'OK',
    isCancelVisible: true,
    isConfirmVisible: true,
    isCancelDisabled: false,
    isConfirmDisabled: false,
    alertPanelView: null,

    cancelButtonView: Flame.ButtonView.extend({
        layout: { width: 90, bottom: 2, right: 110 },
        title: alias('parentView.cancelButtonTitle'),
        isVisible: alias('parentView.isCancelVisible'),
        isDisabled: alias('parentView.isCancelDisabled'),
        action: function() {
            this.get('parentView.alertPanelView').onCancel();
        }
    }),

    confirmButtonView: Flame.ButtonView.extend({
        layout: { width: 90, bottom: 2, right: 2 },
        title: alias('parentView.confirmButtonTitle'),
        isVisible: alias('parentView.isConfirmVisible'),
        isDisabled: alias('parentView.isConfirmDisabled'),
        isDefault: true,
        action: function() {
            this.get('parentView.alertPanelView').onConfirm();
        }
    })
});

Flame.AlertPanelMessageView = Flame.View.extend({
    layout: { left: 10, right: 2, height: 'measuredHeight' },
    childViews: ['iconView', 'messageView'],
    messageViewWidth: 0,
    measuredHeight: function() {
        var width  = "width: %@px;".fmt(this.get('messageViewWidth'));
        var parentClasses = this.nearestOfType(Flame.AlertPanel).get('classNames').join(' ');
        var elementClasses = this.get('messageView.classNames').join(' ');
        var computedMessageViewHeight = Flame.measureString(this.get('message'), parentClasses, elementClasses, width).height;
        return Math.max(Math.min(computedMessageViewHeight, 600), 50);
    }.property('message', 'messageViewWidth'),
    message: null,

    iconView: Flame.ImageView.extend({
        layout: { left: 10 },
        value: nearest('icon')
    }),

    messageView: Flame.LabelView.extend({
        layout: { left: 75, right: 2, height: null },
        didInsertElement: function() {
            this.set('parentView.messageViewWidth', this.$().width());
        },
        allowWrapping: true,
        value: alias('parentView.message')
    })
});

Flame.AlertPanel.reopen({
    layout: { centerX: 0, centerY: -50, width: 400 },

    layoutManager: Flame.VerticalStackLayoutManager.create(),
    classNames: ['flame-alert-panel'],
    icon: Flame.AlertPanel.INFO_ICON,
    isModal: true,
    allowClosingByClickingOutside: false,
    allowMoving: true,
    isCancelVisible: true,
    isConfirmVisible: true,
    isCloseable: true,
    title: '',
    message: '',
    confirmButtonTitle: 'OK',
    cancelButtonTitle: 'Cancel',

    contentView: Flame.View.extend({
        layout: { left: 15, right: 15, top: 36, bottom: 15 },
        layoutManager: Flame.VerticalStackLayoutManager.create({ topMargin: 20, bottomMargin: 17, spacing: 10 }),
        childViews: ['messageView', 'buttonView'],

        messageView: Flame.AlertPanelMessageView.extend({
            message: nearest('message')
        }),
        buttonView: Flame.AlertPanelButtonView.extend({
            confirmButtonTitle: nearest('confirmButtonTitle'),
            cancelButtonTitle: nearest('cancelButtonTitle'),
            alertPanelView: alias('parentView.parentView'),
            isCancelVisible: nearest('isCancelVisible'),
            isConfirmVisible: nearest('isConfirmVisible')
        })
    }),

    // Key event handler for ESC
    cancel: function() {
        this.onCancel();
    },

    // override this to actually do something when user clicks OK
    onConfirm: function() {
        if (this.get('isCloseable')) this.close();
    },

    // override this to actually do something when user clicks Cancel
    onCancel: function() {
        if (this.get('isCloseable')) this.close();
    }
});

Flame.AlertPanel.reopenClass({
    info: function(config) {
        config = jQuery.extend(config || {}, {icon: Flame.AlertPanel.INFO_ICON, isCancelVisible: false});
        return this.createWithMixins(config);
    },

    warn: function(config) {
        config = jQuery.extend(config || {}, {icon: Flame.AlertPanel.WARN_ICON});
        return this.createWithMixins(config);
    },

    error: function(config) {
        config = jQuery.extend(config || {}, {icon: Flame.AlertPanel.ERROR_ICON});
        return this.createWithMixins(config);
    }
});

})();
(function() {
'use strict';

Flame.CollectionView =  Ember.CollectionView.extend(Flame.ViewSupport, Flame.LayoutSupport, Flame.EventManager, {
    classNames: ['flame-collection-view']
});

})();
(function() {
'use strict';

Flame.MenuScrollViewButton = Flame.View.extend({
    classNames: ['scroll-element'],
    classNameBindings: ['directionClass', 'isShown'],

    directionClass: function() {
        return 'scroll-%@'.fmt(this.get('direction'));
    }.property().volatile(),

    isShown: false,
    direction: 'down', // 'up' / 'down'
    useAbsolutePosition: true,

    mouseLeave: function() {
        if (this.get('isShown')) {
            this.get('parentView').stopScrolling();
            return true;
        }
        return false;
    },
    mouseEnter: function() {
        if (this.get('isShown')) {
            this.get('parentView').startScrolling(this.get('direction') === 'up' ? -1 : 1);
            return true;
        }
        return false;
    },

    // Eat the clicks and don't pass them to the elements beneath.
    mouseDown: function() { return true; },
    mouseUp: function() { return true; }
});

Flame.MenuScrollView = Flame.View.extend({
    classNames: ['menu-scroll-view'],
    needScrolling: false,
    scrollDirection: 0,
    scrollPosition: 'top', // 'top', 'middle', 'bottom'

    childViews: ['upArrow', 'viewPort', 'downArrow'],
    scrollSize: 10, // How many pixels to scroll per scroll

    viewPort: Flame.View.extend({
        classNames: ['scroll-view-viewport']
    }),

    upArrow: Flame.MenuScrollViewButton.extend({direction: 'up', layout: { height: 20, top: 0, width: '100%' }}),
    downArrow: Flame.MenuScrollViewButton.extend({direction: 'down', layout: { height: 20, bottom: 0, width: '100%' }}),

    willDestroyElement: function() {
        this._super();
        this.stopScrolling();
    },

    setScrolledView: function(newContent) {
        this.get('viewPort').replace(0, 1, [newContent]);
    },

    scrollPositionDidChange: function() {
        var upArrow = this.get('upArrow');
        var downArrow = this.get('downArrow');
        var scrollPosition = this.get('scrollPosition');
        upArrow.set('isShown', this.get('needScrolling') && scrollPosition !== 'top');
        downArrow.set('isShown', this.get('needScrolling') && scrollPosition !== 'bottom');
    }.observes('scrollPosition', 'needScrolling'),

    startScrolling: function(scrollDirection) {
        this.set('scrollDirection', scrollDirection);
        this.scroll();
    },

    stopScrolling: function() {
        this.set('scrollDirection', 0);
        if (this._timer) {
            Ember.run.cancel(this._timer);
        }
    },

    _recalculateSizes: function() {
        var height = this.get('parentView.layout.height');
        if (height > 0) {
            var paddingAndBorders = 5 + 5 + 1 + 1;  // XXX obtain paddings & borders from MenuView?
            this.set('layout', { height: height - paddingAndBorders, width: '100%' });
            var viewPort = this.get('viewPort');
            if (viewPort) {
                viewPort.set('layout', {
                    height: height - paddingAndBorders,
                    top: 0,
                    width: '100%'
                });
            }
        }
    }.observes('parentView.layout', 'needScrolling'),

    _scrollTo: function(position, scrollTime) {
        var viewPort = this.get('viewPort').$();
        viewPort.scrollTop(position);
    },

    scroll: function() {
        var scrollDirection = this.get('scrollDirection');
        var scrollTime = 20;
        var scrollSize = this.get('scrollSize');
        var viewPort = this.get('viewPort').$();
        var oldTop = viewPort.scrollTop();
        var viewPortHeight = viewPort.height();
        var continueScrolling = true;
        var scrollPosition = this.get('scrollPosition');

        var delta = scrollSize;
        if (scrollDirection === -1) {
            if (delta > oldTop) {
                delta = oldTop;
                continueScrolling = false;
            }
        } else if (scrollDirection === 1) {
            var listHeight = this.get('viewPort.firstObject').$().outerHeight();
            var shownBottom = oldTop + viewPortHeight;
            if (shownBottom + delta >= listHeight) {
                delta = listHeight - shownBottom;
                continueScrolling = false;
            }
        }
        delta *= scrollDirection;
        this._scrollTo(oldTop + delta, 0.9 * scrollTime * Math.abs(delta / scrollSize));

        if (!continueScrolling) {
            if (scrollDirection === 1) {
                scrollPosition = 'bottom';
            } else if (scrollDirection === -1) {
                scrollPosition = 'top';
            }
            this.stopScrolling();
        } else {
            this._timer = Ember.run.later(this, this.scroll, scrollTime);
            scrollPosition = 'middle';
        }
        this.set('scrollPosition', scrollPosition);
    }
});

})();
(function() {
'use strict';






// Only to be used in Flame.MenuView. Represent menu items with normal JS objects as creation of one Ember object took
// 3.5 ms on fast IE8 machine.
Flame.MenuItem = function MenuItem(opts) {
    for (var key in opts) {
        if (opts.hasOwnProperty(key)) {
            this[key] = opts[key];
        }
    }
};

Flame.MenuItem.prototype.renderToBuffer = function(buffer) {
    var classes = ['flame-view', 'flame-list-item-view', 'flame-menu-item-view'];
    if (this.isSelected) classes.push('is-selected');
    if (!this.isEnabled()) classes.push('is-disabled');
    var subMenuLength = Ember.isNone(this.subMenuItems) ? -1 : this.subMenuItems.get('length');
    var template = '<div id="%@" class="%@" %@>%@%@%@</div>';
    buffer.push(
        template.fmt(
            this.id,
            classes.join(' '),
            this.item.tooltip ? 'title="%@"'.fmt(this.item.tooltip) : '',
            this.isChecked ? '<div class="flame-menu-item-view-checkmark"></div>' : '',
            Handlebars.Utils.escapeExpression(this.title),
            subMenuLength > 0 ? '<div class="menu-indicator"></div>' : ''
        )
    );
};

Flame.MenuItem.prototype.isEnabled = function() {
    return !(this.isDisabled || (this.subMenuItems && this.subMenuItems.length === 0));
};

Flame.MenuItem.prototype.isSelectable = function() {
    return this.isEnabled() && !this.subMenuItems;
};

Flame.MenuItem.prototype.$ = function() {
    return Ember.$('#%@'.fmt(this.id));
};

Flame.MenuItem.prototype.closeSubMenu = function() {
    var subMenu = this.subMenuView;
    if (!Ember.isNone(subMenu)) {
        subMenu.close();
        this.subMenuView = null;
    }
};

/**
  A menu. Can be shown as a "stand-alone" menu or in cooperation with a SelectButtonView.

  MenuView has a property 'subMenuKey'. Should objects based on which the menu is created return null/undefined for
  that property, the item itself will be selectable. Otherwise if the property has more than zero values, a submenu
  will be shown.

  Because of the implementation details, this menu will hold values of undefined or null as the same as not set. Thus,
  no selectable menu item must have such value their value.
*/
Flame.MenuView = Flame.Panel.extend(Flame.ActionSupport, {
    classNames: ['flame-menu'],
    childViews: ['contentView'],
    contentView: Flame.MenuScrollView,
    dimBackground: false,
    allowClosingByCancelButton: true,
    subMenuKey: 'subMenu',
    itemTitleKey: 'title',
    /* Attribute that can be used to indicate a disabled menu item. The item will be disabled only if
     * isEnabled === false, not some falseish value. */
    itemEnabledKey: 'isEnabled',
    itemCheckedKey: 'isChecked',
    itemValueKey: 'value',
    itemActionKey: 'action',
    itemHeight: 21,
    /* Margin between the menu and top/bottom of the viewport. */
    menuMargin: 12,
    minWidth: null, // Defines minimum width of menu
    items: null,
    parentMenu: null,
    value: null,
    _allItemsDoNotFit: true,
    _anchorElement: null,
    _menuItems: null,
    _highlightIndex: -1, // Currently highlighted index.
    _userHighlightIndex: -1, // User selected highlighted index
    // Reflects the content item in this menu or the deepest currently open submenu that is currently highlighted,
    // regardless of whether mouse button is up or down. When mouse button is released, this will be set as the real
    // selection on the top-most menu, unless it's undefined (happens if currently on a non-selectable item)
    // This is to be handled as a unmodifiable object: always create a new object instead of mutating its properties.
    _internalSelection: { isSet: false, value: null },

    init: function() {
        this._super();
        this._needToRecreateItems();
    },

    _calculateMenuWidth: function() {
        var items = this.get('items') || [];
        if (Ember.get(items, 'length') === 0) {
            return;
        }
        var itemTitleKey = this.get('itemTitleKey');
        var allTitles = items.map(function(item) { return Ember.get(item, itemTitleKey); });
        // Give the menus a 16px breathing space to account for sub menu indicator, and to give some right margin (+18px for the padding)
        return Flame.measureString(allTitles, 'ember-view flame-view flame-list-item-view flame-menu-item-view', 'title').width + 16 + 18;
    },

    _createMenuItems: function() {
        var items = this.get('items'),
            itemCheckedKey = this.get('itemCheckedKey'),
            itemEnabledKey = this.get('itemEnabledKey'),
            itemTitleKey = this.get('itemTitleKey'),
            itemValueKey = this.get('itemValueKey'),
            subMenuKey = this.get('subMenuKey'),
            selectedValue = this.get('value'),
            valueIsSet = !Ember.isNone(selectedValue),
            menuItems;
        menuItems = (items || []).map(function(item, i) {
            // Only show the selection on the main menu, not in the submenus.
            return new Flame.MenuItem({
                item: item,
                isSelected: valueIsSet ? Ember.get(item, itemValueKey) === selectedValue : false,
                isDisabled: Ember.get(item, itemEnabledKey) === false,
                isChecked: Ember.get(item, itemCheckedKey),
                subMenuItems: Ember.get(item, subMenuKey),
                title: Ember.get(item, itemTitleKey),
                id: this._indexToId(i)
            });
        }, this);
        return menuItems;
    },

    _needToRecreateItems: function() {
        var menuItems = this._createMenuItems();
        this.set('_menuItems', menuItems);
        if (Ember.isNone(this.get('parentMenu'))) {
            menuItems.forEach(function(item, i) {
                if (item.isSelected) this.set('_highlightIndex', i);
            }, this);
        }
        this.get('contentView').setScrolledView(this._createMenuView());
        if (this.get('_anchorElement')) {
            this._updateMenuSize();
        }

        // Set content of scroll stuff
        // calculate the the height of menu
    }.observes('items'),

    _createMenuView: function() {
        var items = this.get('_menuItems');
        return Flame.View.create({
            useAbsolutePosition: false,
            render: function(buffer) {
                items.forEach(function(menuItem) { menuItem.renderToBuffer(buffer); });
            }
        });
    },

    makeSelection: function() {
        var parentMenu = this.get('parentMenu');
        var action, value;
        if (!Ember.isNone(parentMenu)) {
            parentMenu.makeSelection();
            this.close();
        } else {
            var internalSelection = this.get('_internalSelection');
            if (internalSelection.isSet) {
                value = Ember.get(internalSelection.value, this.get('itemValueKey'));
                this.set("value", value);
                // If we have an action, call it on the selection.
                action = Ember.get(internalSelection.value, this.get('itemActionKey')) || this.get('action');
            }
            // Sync the values before we tear down all bindings in close() which calls destroy().
            Ember.run.sync();
            // Close this menu before firing an action - the action might open a new popup, and if closing after that,
            // the new popup panel is popped off the key responder stack instead of this menu.
            this.close();
            if (!Ember.isNone(action)) {
                this.fireAction(action, value);
            }
        }
    },

    subMenu: function() {
        return Flame.MenuView.extend({
            isModal: false,

            popup: function(anchor, position) {
                if (!this.get('layout.width')) {
                    // We already need to know the width of the menu at this point so that Panel#popup
                    // can correctly position it.
                    var menuWidth = Math.max(this.get('minWidth') || 0, this._calculateMenuWidth());
                    this.set('layout.width', menuWidth);
                }
                this._super(anchor, position);
            },

            _layoutRelativeTo: function(anchor, position) {
                var layout = this._super(anchor, position);
                // If already positioned on the left, nothing else needs to be checked.
                if (this.get('subMenuPosition') === Flame.POSITION_LEFT) return layout;

                if (layout.movedX) {
                    // Any further opened submenu should be opened on the left side.
                    this.set('subMenuPosition', Flame.POSITION_LEFT);
                    layout = this._super(anchor, Flame.POSITION_LEFT);
                }
                return layout;
            }
        });
    }.property(),

    // This function is here to break the dependency between MenuView and MenuItemView
    createSubMenu: function(subMenuItems) {
        return this.get('subMenu').create({
            items: subMenuItems,
            parentMenu: this,
            subMenuKey: this.get('subMenuKey'),
            itemEnabledKey: this.get('itemEnabledKey'),
            itemTitleKey: this.get('itemTitleKey'),
            itemValueKey: this.get('itemValueKey'),
            itemHeight: this.get('itemHeight'),
            subMenuPosition: this.get('subMenuPosition')
        });
    },

    closeCurrentlyOpenSubMenu: function() {
        // observers of highlightIndex should take care that closing is propagated to the every open menu underneath
        // this menu. Close() sets highlightIndex to -1, _highlightWillChange() will call closeSubMenu() on the item
        // which then calls close() on the menu it depicts and this is continued until no open menus remain under the
        // closed menu.
        var index = this.get('_highlightIndex');
        if (index >= 0) {
            this.get('_menuItems').objectAt(index).closeSubMenu();
        }
    },

    popup: function(anchorElementOrJQ, position) {
        if (Ember.isNone(this.get('parentMenu'))) {
            this._openedAt = new Date().getTime();
        }
        var anchorElement = anchorElementOrJQ instanceof jQuery ? anchorElementOrJQ : anchorElementOrJQ.$();
        this._super(anchorElement, position);
        this.set('_anchorElement', anchorElement);
        this._updateMenuSize();
    },

    _updateMenuSize: function() {
        var anchorElement = this.get('_anchorElement');
        // These values come from the CSS but we still need to know them here. Is there a better way?
        var paddingTop = 5;
        var paddingBottom = 5;
        var borderWidth = 1;
        var totalPadding = paddingTop + paddingBottom;
        var margin = this.get('menuMargin');
        var menuOuterHeight = this.get('_menuItems').get('length') * this.get('itemHeight') + totalPadding + 2 * borderWidth;
        var wh = $(window).height();
        var anchorTop = anchorElement.offset().top;
        var anchorHeight = anchorElement.outerHeight();
        var layout = this.get('layout');

        var isSubMenu = !Ember.isNone(this.get('parentMenu'));
        var spaceDownwards = wh - anchorTop + (isSubMenu ? (borderWidth + paddingTop) : (-anchorHeight));
        var needScrolling = false;

        if (menuOuterHeight + margin * 2 <= wh) {
            if (isSubMenu && spaceDownwards >= menuOuterHeight + margin) {
                layout.set('top', anchorTop - (borderWidth + paddingTop));
            } else if (spaceDownwards < menuOuterHeight + margin) {
                layout.set('top', wh - (menuOuterHeight + margin));
            }
        } else {
            // Constrain menu height
            menuOuterHeight = wh - 2 * margin;
            layout.set('top', margin);
            needScrolling = true;
        }
        layout.set('height', menuOuterHeight);
        if (!layout.width) {
            var menuWidth = Math.max(this.get('minWidth') || 0, this._calculateMenuWidth());
            layout.set('width', menuWidth);
        }
        this.notifyPropertyChange('layout');
        this.set('contentView.needScrolling', needScrolling);
    },

    close: function() {
        if (this.isDestroyed) { return; }
        this.set('_highlightIndex', -1);
        this._clearKeySearch();
        this._super();
    },

    /* event handling starts */
    mouseDown: function() {
        return true;
    },

    cancel: function() {
        var parentMenu = this.get('parentMenu');
        if (!Ember.isNone(parentMenu)) {
            parentMenu.closeCurrentlyOpenSubMenu();
            return true;
        } else {
            return this._super();
        }
    },

    moveUp: function() { return this._selectNext(-1); },
    moveDown: function() { return this._selectNext(1); },

    moveRight: function() {
        this._tryOpenSubmenu(true);
        return true;
    },

    moveLeft: function() {
        var parentMenu = this.get('parentMenu');
        if (!Ember.isNone(parentMenu)) parentMenu.closeCurrentlyOpenSubMenu();
        return true;
    },

    insertNewline: function() {
        this.makeSelection();
        return true;
    },

    keyPress: function(event) {
        var key = String.fromCharCode(event.which);
        if (event.which > 31 && key !== '') { // Skip control characters.
            this._doKeySearch(key);
            return true;
        }
        return false;
    },

    handleMouseEvents: function(event) {
        // This should probably be combined with our event handling in event_manager.
        var itemIndex = this._idToIndex(event.currentTarget.id);
        // jQuery event handling: false bubbles the stuff up.
        var retVal = false;

        if (event.type === 'mouseenter') {
            retVal = this.mouseEntered(itemIndex);
        } else if (event.type === 'mouseup') {
            retVal = this.mouseClicked(itemIndex);
        } else if (event.type === 'mousedown') {
            retVal = true;
        }
        return !retVal;
    },

    /* Event handling ends */

    mouseClicked: function(index) {
        // If we're just handling a mouseUp that is part of the click that opened this menu, do nothing.
        // When the mouseUp follows within 100ms of opening the menu, we know that's the case.
        if (Ember.isNone(this.get('parentMenu')) && new Date().getTime() - this._openedAt < 300) {
            return;
        }

        this.set('_highlightIndex', index);
        // This will currently select the item even if we're not on the the current menu. Will need to figure out how
        // to deselect an item when cursor leaves the menu totally (that is, does not move to a sub-menu).
        if (this.get('_userHighlightIndex') >= 0) {
            this.makeSelection();
        }
        return true;
    },

    mouseEntered: function(index) {
        this.set('_userHighlightIndex', index);
        this._tryOpenSubmenu(false);
        return true;
    },

    _selectNext: function(increment) {
        var menuItems = this.get('_menuItems');
        var len = menuItems.get('length');
        var item;
        var index = this.get('_highlightIndex') + increment;
        for (; index >= 0 && index < len; index += increment) {
            item = menuItems.objectAt(index);
            if (item.isEnabled()) {
                this.set('_highlightIndex', index);
                break;
            }
        }
        this._clearKeySearch();
        return true;
    },

    _valueDidChange: function() {
        var value = this.get('value');
        var valueKey = this.get('itemValueKey');
        if (!Ember.isNone(value) && !Ember.isNone(valueKey)) {
            var index = this._findIndex(function(item) {
                return Ember.get(item, valueKey) === value;
            });
            if (index >= 0) {
                this.set('_highlightIndex', index);
            }
        }
    }.observes('value'),

    // Propagate internal selection to possible parent
    _internalSelectionDidChange: function() {
        var selected = this.get('_internalSelection');
        Ember.trySet(this, 'parentMenu._internalSelection', selected);
    }.observes('_internalSelection'),

    _findIndex: function(identityFunc) {
        var menuItems = this.get('items');
        var i = 0, len = menuItems.get('length');
        for (; i < len; i++) {
            if (identityFunc(menuItems.objectAt(i))) {
                return i;
            }
        }
        return -1;
    },

    _findByName: function(name) {
        var re = new RegExp('^' + name.replace(/[\^$*+?.(){}\[\]|]/g, "\\$&"), 'i');
        var titleKey = this.get('itemTitleKey');
        return this._findIndex(function(menuItem) {
            return re.test(Ember.get(menuItem, titleKey));
        });
    },

    _toggleClass: function(className, index, addOrRemove) {
        var menuItem = this.get('_menuItems').objectAt(index);
        menuItem.$().toggleClass(className, addOrRemove);
    },

    _highlightWillChange: function() {
        var index = this.get('_highlightIndex');
        var lastItem = this.get('_menuItems').objectAt(index);
        if (!Ember.isNone(lastItem)) {
            this._toggleClass('is-selected', index);
            lastItem.isSelected = false;
            lastItem.closeSubMenu();
        }
    }.observesBefore('_highlightIndex'),

    _highlightDidChange: function() {
        var index = this.get('_highlightIndex');
        var newItem = this.get('_menuItems').objectAt(index);
        var internalSelection = { isSet: false, value: null };
        if (!Ember.isNone(newItem)) {
            this._toggleClass('is-selected', index);
            newItem.isSelected = true;
            if (newItem.isSelectable()) {
                internalSelection = { isSet: true, value: newItem.item };
            }
        }
        this.set('_internalSelection', internalSelection);
    }.observes('_highlightIndex'),

    /**
      We only want to allow selecting menu items after the user has moved the mouse. We update
      userHighlightIndex when user highlights something, and internally we use highlightIndex to keep
      track of which item is highlighted, only allowing selection if user has highlighted something.
      If we don't ensure the user has highlighted something before allowing selection, this means that when
      a user clicks a SelectViewButton to open a menu, the mouseUp event (following the mouseDown on the select)
      would be triggered on a menu item, and this would cause the menu to close immediately.
    */
    _userHighlightIndexDidChange: function() {
        this.set('_highlightIndex', this.get('_userHighlightIndex'));
    }.observes('_userHighlightIndex'),

    _clearKeySearch: function() {
        if (!Ember.isNone(this._timer)) {
            Ember.run.cancel(this._timer);
        }
        this._searchKey = '';
    },

    _doKeySearch: function(key) {
        this._searchKey = (this._searchKey || '') + key;
        var index = this._findByName(this._searchKey);
        if (index >= 0) {
            this.set('_highlightIndex', index);
        }

        if (!Ember.isNone(this._timer)) {
            Ember.run.cancel(this._timer);
        }
        this._timer = Ember.run.later(this, this._clearKeySearch, 1000);
    },

    _indexToId: function(index) {
        return "%@-%@".fmt(this.get('elementId'), index);
    },

    _idToIndex: function(id) {
        var re = new RegExp("%@-(\\d+)".fmt(this.get('elementId')));
        var res = re.exec(id);
        return res && res.length === 2 ? parseInt(res[1], 10) : -1;
    },

    _tryOpenSubmenu: function(selectItem) {
        var index = this.get('_highlightIndex');
        var item = this.get('_menuItems').objectAt(index);
        if (!item) {
            return false;
        }
        var subMenuItems = item.subMenuItems;
        if (!Ember.isNone(subMenuItems) && item.isEnabled() && subMenuItems.get('length') > 0) {
            this._clearKeySearch();
            var subMenu = item.subMenuView;
            if (Ember.isNone(subMenu)) {
                subMenu = this.createSubMenu(subMenuItems);
                item.subMenuView = subMenu;
            }
            subMenu.popup(item.$(), this.get('subMenuPosition') || Flame.POSITION_RIGHT);
            if (selectItem) subMenu._selectNext(1);
            return true;
        }
        return false;
    },

    didInsertElement: function() {
        this._super();
        var self = this;
        this.$().on('mouseenter mouseup mousedown', '.flame-menu-item-view', function(event) {
            return self.handleMouseEvents(event);
        });
    },

    willDestroyElement: function() {
        this._super();
        this.$().off('mouseenter mouseup mousedown');
    }
});

})();
(function() {
'use strict';


Flame.AutocompleteMenuView = Flame.MenuView.extend({
    keyPress: function(event) {
        return false;
    },
    deleteBackward: function() {
        // Prevent backspace doing native action (go back in history in Chrome) if user is midst of selecting items
        return this.get('highlightIndex') >= 0;
    },
    insertTab: function() {
        this.close();
        return false;
    },
    moveDown: function() {
        // Using resignKeyResponder() on the text field won't work, because it was already 'resigned' but keeps
        // focus, apparently by design. We need the text input to lose focus though or the selection of the menu options
        // with the arrow keys gets messed up
        this.get('textField').didLoseKeyResponder();
        this._super();
    },
    moveRight: function() {
        return false;
    },
    moveLeft: function() {
        return false;
    },
    close: function() {
        this._super();
        // See above
        this.get('textField').didBecomeKeyResponder();
    }
});

})();
(function() {
'use strict';

var alias = Ember.computed.alias,
    trueFalse = Flame.computed.trueFalse,
    equal = Ember.computed.equal;

Flame.TextField = Ember.TextField.extend(Flame.EventManager, Flame.FocusSupport, {
    classNameBindings: ['isInvalid', 'isEditableLabel', 'isFocused'],
    acceptsKeyResponder: true,
    type: trueFalse('parentView.isPassword', 'password', 'text'),
    isInvalid: equal('parentView.isValid', false),
    value: alias('parentView.value'),
    placeholder: alias('parentView.placeholder'),
    isEditableLabel: alias('parentView.isEditableLabel'),
    isVisible: alias('parentView.isVisible'),
    disabled: alias('parentView.isDisabled'),
    name: alias('parentView.name'),
    attributeBindings: ['name', 'disabled'],
    _setValueDelay: 700,
    _timer: null,

    init: function() {
        this._super();
        // This would normally call `interpretKeyEvents`, but Flame.EventManager
        // already does this on `keyDown`.
        this.off('keyUp');
        this.off('input');
        this.on('input', this, this._setValue);
    },

    willDestroyElement: function() {
        if (this._timer) {
            Ember.run.cancel(this._timer);
            this._elementValueDidChange();
        }
    },

    _setValue: function() {
        if (this.get('parentView.setValueOnEachKeyUp')) {
            this._elementValueDidChange();
        } else {
            if (this._timer) Ember.run.cancel(this._timer);
            this._timer = Ember.run.later(this, function() {
                this._elementValueDidChange();
            }, this._setValueDelay);
        }
    },

    // Trigger a value change notification also when inserting a new line. Otherwise the action could be fired
    // before the changed value is propagated to this.value property.
    insertNewline: function() {
        this._elementValueDidChange();
        Ember.run.sync();
        return false;
    },

    cancel: function() { return false; },

    // The problem here is that we need browser's default handling for these events to make the input field
    // work. If we had no handlers here and no parent/ancestor view has a handler returning true, it would
    // all work. But if any ancestor had a handler returning true, the input field would break, because
    // true return value signals jQuery to cancel browser's default handling. It cannot be remedied by
    // returning true here, because that has the same effect, thus we need a special return value (which
    // Flame.EventManager handles specially by stopping the parent propagation).
    mouseDown: function() { return Flame.ALLOW_BROWSER_DEFAULT_HANDLING; },
    mouseMove: function() { return Flame.ALLOW_BROWSER_DEFAULT_HANDLING; },
    mouseUp: function() { return Flame.ALLOW_BROWSER_DEFAULT_HANDLING; }
});

/**
  The actual text field is wrapped in another view since browsers like Firefox
  and IE don't support setting the `right` CSS property (used by LayoutSupport)
  on input fields.
*/
Flame.TextFieldView = Flame.View.extend(Flame.ActionSupport, {
    classNames: ['flame-text'],
    childViews: ['textField'],
    acceptsKeyResponder: true,

    layout: { left: 0, top: 0 },
    defaultHeight: 22,
    defaultWidth: 200,

    value: '',
    placeholder: null,
    isPassword: false,
    isValid: null,
    isEditableLabel: false,
    isVisible: true,
    isDisabled: false,
    name: null,
    /**
      It might be that setting the value is very costly. In that case, instead of
      setting the value on each key up, when `setValueOnEachKeyUp` is set to false
      the value is only set after typing has stopped for the value set in `_setValueDelay`.
    */
    setValueOnEachKeyUp: true,

    becomeKeyResponder: function() {
        this.get('textField').becomeKeyResponder();
    },

    insertNewline: function() {
        return this.fireAction();
    },

    textField: Flame.TextField
});

})();
(function() {
'use strict';


Flame.AutocompleteTextFieldView = Flame.TextFieldView.extend(Flame.Statechart, Flame.ActionSupport, {
    _autocompleteView: null,
    _lastQueuedQuery: null,
    autocompleteDelegate: null,
    initialFlameState: 'idle',

    textField: Flame.TextField.extend({
        _debounce: null,

        keyUp: function(event) {
            this._super(event);
            this._debounce = Ember.run.debounce(this, 'autocompleteAction', event, 500);
        },

        autocompleteAction: function(event) {
            if (event.which === 8 || event.which > 31) {
                // Don't want to wait until the value has synced, so just grab the raw val from input
                var query = this.$().val();
                this.get('parentView').doAutocompleteRequest(query);
                return true;
            }
        },

        willDestroyElement: function() {
            this._super();
            if (this._debounce) Ember.run.cancel(this._debounce);
        }
    }),

    idle: Flame.State.extend({
        enterState: function() {
            var lastQuery = this.get('owner._lastQueuedQuery');
            if (lastQuery) {
                this.set('owner._lastQueuedQuery', null);
                this.doAutocompleteRequest(lastQuery);
            }
        },

        doAutocompleteRequest: function(query) {
            if (!this.get('owner.autocompleteDelegate')) return;

            if (query && this.get('owner.autocompleteDelegate').fetchAutocompleteResults(query, this.get('owner'))) {
                this.gotoFlameState('requesting');
            } else {
                this.get('owner')._closeAutocompleteMenu();
            }
        }
    }),

    requesting: Flame.State.extend({
        enterState: function() {
            this.get('owner')._closeAutocompleteMenu();
        },

        doAutocompleteRequest: function(query) {
            if (query) this.set('owner._lastQueuedQuery', query);
        },

        didFinishAutocompleteRequest: function() {
            this.gotoFlameState('idle');
        },

        didFetchAutocompleteResults: function(options) {
            if (options.length === 0) {
                this.get('owner')._closeAutocompleteMenu();
                return;
            }

            // Do not bother to show this result as it's going to be replaced anyway soon with _lastQueuedtQuery results
            if (this.get('owner._lastQueuedQuery') === null) {
                this.get('owner')._showAutocompleteMenu(options);
            }
        }
    }),

    _showAutocompleteMenu: function(options) {
        if (!this._autocompleteMenu || this._autocompleteMenu.isDestroyed) {
            this._autocompleteMenu = Flame.AutocompleteMenuView.create({
                minWidth: this.$().width(),
                target: this,
                textField: this.get('textField'),
                action: '_selectAutocompleteItem',
                items: options
            });
            this._autocompleteMenu.popup(this);
        } else if (!this._autocompleteMenu.isDestroyed) {
            this._autocompleteMenu.set('items', options);
        }
    },

    _selectAutocompleteItem: function(id) {
        this.set('value', this._autocompleteMenu.get('items').findBy('value', id).title);
    },

    _closeAutocompleteMenu: function() {
        if (this._autocompleteMenu) {
            this._autocompleteMenu.close();
            this._autocompleteMenu = null;
        }
    }
});

})();
(function() {
'use strict';



// A checkbox. The state of the checkbox is indicated by the isSelected property.
Flame.CheckboxView = Flame.ButtonView.extend({
    classNames: ['flame-checkbox-view'],
    isSticky: true,

    render: function(buffer) {
        buffer.push('<div class="flame-checkbox-box"></div>');
        this.renderCheckMark(buffer);
        buffer.push('<label class="flame-checkbox-label">');
        buffer.push(Ember.isNone(this.get('title')) ? '' : Handlebars.Utils.escapeExpression(this.get('title')));
        buffer.push('</label>');
    },

    renderCheckMark: function(buffer) {
        var imgUrl = Flame.image('checkmark.svg');
        buffer.push('<div class="flame-view flame-checkbox-checkmark" style="left: 4px; top: 2px;"><img src="' + imgUrl + '"></div>');
    }
});

})();
(function() {
'use strict';

Flame.SelectButtonView = Flame.ButtonView.extend({
    classNames: ['flame-select-button-view'],
    items: [],
    value: undefined,
    defaultHeight: 22,
    itemTitleKey: 'title',
    itemValueKey: 'value',
    itemActionKey: 'action',
    subMenuKey: 'subMenu',

    handlebars: function() {
        var itemTitleKey = this.get('itemTitleKey');
        return '<label {{bind-attr title="view._selectedMenuItem.%@"}}>{{view._selectedMenuItem.%@}}</label><div><img src="%@"></div>'.fmt(itemTitleKey, itemTitleKey, Flame.image('select_button_arrow.svg'));
    }.property('itemTitleKey'),

    _selectedMenuItem: function() {
        if (this.get('value') === undefined) return undefined;
        var selectedItem = this._findItem();
        return selectedItem;
    }.property('value', 'itemValueKey', 'subMenuKey', 'items'),

    itemsDidChange: function() {
        if (this.get('items') && this.get('items.length') > 0 && !this._findItem()) {
            this.set('value', this.get('items.firstObject.%@'.fmt(this.get('itemValueKey'))));
        }
    }.observes('items'),

    _findItem: function(itemList) {
        // TODO Rewrite this to return a path to the item or an empty array in case no item can be found.
        if (!itemList) itemList = this.get('items');
        var itemValueKey = this.get('itemValueKey'),
            value = this.get('value'),
            subMenuKey = this.get('subMenuKey'),
            foundItem;
        if (Ember.isNone(itemList)) return foundItem;
        itemList.forEach(function(item) {
            var subMenu = Ember.get(item, subMenuKey);
            if (subMenu) {
                var possiblyFound = this._findItem(subMenu);
                if (!Ember.isNone(possiblyFound)) foundItem = possiblyFound;
            } else if (Ember.get(item, itemValueKey) === value) {
                foundItem = item;
            }
        }, this);
        return foundItem;
    },

    mouseDown: function() {
        if (!this.get('isDisabled')) this._openMenu();
        return true;
    },

    insertSpace: function() {
        this._openMenu();
        return true;
    },

    _openMenu: function() {
        this.gotoFlameState('mouseDownInside');

        // This has to be created dynamically to set the selectButtonView reference (parentView does not work
        // because a menu is added on the top level of the view hierarchy, not as a child of this view)
        var self = this;
        Flame.MenuView.createWithMixins({
            selectButtonView: this,
            itemTitleKey: this.get('itemTitleKey'),
            itemValueKey: this.get('itemValueKey'),
            itemActionKey: this.get('itemActionKey'),
            subMenuKey: this.get('subMenuKey'),
            items: Ember.computed.alias('selectButtonView.items'),
            value: Ember.computed.alias('selectButtonView.value'),
            minWidth: this.get('layout.width') || this.$().width(),
            close: function() {
                self.gotoFlameState('idle');
                this._super();
            }
        }).popup(this);
    }
});

})();
(function() {
'use strict';




Flame.ComboBoxView = Flame.SelectButtonView.extend({
    classNames: ['flame-combo-box-view'],
    childViews: ['textView', 'buttonView'],
    handlebars: null,
    acceptsKeyResponder: false,

    textView: Flame.TextFieldView.extend({
        layout: { left: 0, right: 3 },
        value: Ember.computed.alias('parentView.value')
    }),

    insertSpace: function() { return false; },

    buttonView: Flame.ButtonView.extend({
        acceptsKeyResponder: false,
        handlebars: '<img src="%@">'.fmt(Flame.image('select_button_arrow.svg')),
        layout: { right: -2, width: 22, height: 22 },

        action: function() {
            this.get('parentView')._openMenu();
        }
    })
});

})();
(function() {
'use strict';


Flame.DisclosureView = Flame.LabelView.extend({
    classNames: ['flame-disclosure-view'],

    imageExpanded: Flame.image('disclosure_triangle_down.svg'),
    imageCollapsed: Flame.image('disclosure_triangle_right.svg'),

    image: function() {
        return this.get('visibilityTarget') ? this.get('imageExpanded') : this.get('imageCollapsed');
    }.property('visibilityTarget', 'imageExpanded', 'imageCollapsed'),

    handlebars: '<img {{bind-attr src="view.image"}}> {{view.value}}',

    action: function() {
        this.toggleProperty('visibilityTarget');
        return true;
    }
});

})();
(function() {
'use strict';


Flame.ErrorMessageView = Flame.LabelView.extend({
    classNames: ['flame-form-view-validation-error'],
    classNameBindings: ['pointToClass', 'skinny'],
    skinny: false,
    pointTo: 'left',
    textAlign: function() {
        return this.get('pointTo') === 'left' ? Flame.ALIGN_LEFT : Flame.ALIGN_RIGHT;
    }.property('pointTo'),
    pointToClass: function() {
        return 'points-to-%@'.fmt(this.get('pointTo'));
    }.property('pointTo'),
    handlebars: '<div class="pointer"></div><div class="error-box">{{view.value}}</div>'
});

})();
(function() {
'use strict';

// You must set on object to 'object' that the form manipulates (or use a binding)
// Optionally you can set a defaultTarget, that will be used to set the default target for any actions
// triggered from the form (button clicks and default submit via hitting enter)
Flame.FormView = Flame.View.extend({
    classNames: ['form-view'],
    tagName: 'form',

    defaultTarget: null,
    object: null,

    leftMargin: 20,
    rightMargin: 20,
    topMargin: 20,
    bottomMargin: 20,
    rowSpacing: 10,
    columnSpacing: 10,
    buttonSpacing: 15,
    labelWidth: 150,
    labelAlign: Flame.ALIGN_RIGHT,
    buttonWidth: 90,
    controlWidth: null,// set this if you want to force a set control width
    defaultFocus: null,
    _focusRingMargin: 3,

    init: function() {
        this._super();

        if (!this.get('layoutManager')) {
            this.set('layoutManager', Flame.VerticalStackLayoutManager.create({
                topMargin: this.get('topMargin'),
                spacing: this.get('rowSpacing'),
                bottomMargin: this.get('bottomMargin')
            }));
        }

        this.set('_errorViews', []);
        this.set('controls', []);

        this._propertiesDidChange();
    },

    _propertiesDidChange: function() {
        this.destroyAllChildren();

        this.get('properties').forEach(function(descriptor) {
            var view = this._createLabelAndControl(descriptor);
            this.pushObject(this.createChildView(view));
        }, this);

        var buttons = this.get('buttons');
        if (buttons && buttons.get('length') > 0) {
            this.pushObject(this.createChildView(this._buildButtons(buttons)));
        }
    }.observes('properties.[]'),

    _createLabelAndControl: function(desc) {
        var descriptor = Ember.Object.createWithMixins(desc);
        var control = descriptor.view || this._buildControl(descriptor);
        var formView = this;

        var view;
        if (Ember.isNone(descriptor.label)) {
            view = this._createChildViewWithLayout(control, this, this.get('leftMargin') + this._focusRingMargin, this.get('rightMargin') + this._focusRingMargin);
        }
        if (descriptor.type === 'checkbox') {
            view = this._createChildViewWithLayout(control, this, this.get('leftMargin') + this.labelWidth + this.columnSpacing - 4, this._focusRingMargin);
        }
        if (view) {
            // The FormView expects all controls to be within another view
            return Flame.View.extend({
                layoutManager: Flame.VerticalStackLayoutManager.create({ topMargin: this._focusRingMargin, spacing: 0, bottomMargin: this._focusRingMargin }),
                childViews: ['control'],
                control: view
            });
        }

        view = {
            layout: { left: this.get('leftMargin'), right: this.get('rightMargin') },
            layoutManager: Flame.VerticalStackLayoutManager.create({ topMargin: this._focusRingMargin, spacing: 0, bottomMargin: this._focusRingMargin }),
            childViews: ['label', 'control'],

            isVisible: desc.isVisible === undefined ? true : desc.isVisible,

            label: this._buildLabel(descriptor),
            control: function() {
                return formView._createChildViewWithLayout(control, this, formView.labelWidth + formView.columnSpacing, formView._focusRingMargin);
            }.property()
        };
        if (descriptor.get('isVisibleBinding')) {
            delete view.isVisible;
            view.isVisibleBinding = descriptor.get('isVisibleBinding');
        }

        return Flame.View.extend(view);
    },

    _createChildViewWithLayout: function(view, parent, leftMargin, rightMargin) {
        var childView = parent.createChildView(view);
        if (!childView.get('layout')) childView.set('layout', {});
        childView.set('layout.left', leftMargin);
        childView.set('layout.right', rightMargin);
        return childView;
    },

    _buildLabel: function(descriptor) {
        return Flame.LabelView.extend({
            layout: { left: 0, width: this.get('labelWidth'), top: this._focusRingMargin },
            ignoreLayoutManager: true,
            textAlign: this.get('labelAlign'),
            value: descriptor.get('label') + ':',
            attributeBindings: ['title'],
            title: descriptor.get('tooltip') || descriptor.get('label')
        });
    },

    _buildButtons: function(buttons) {
        var formView = this;
        return Flame.View.extend({
            layout: { left: this.get('leftMargin'), right: this.get('rightMargin'), topMargin: this.get('buttonSpacing'), height: 30 },
            init: function() {
                this._super();
                var right = formView._focusRingMargin;
                (buttons || []).forEach(function(descriptor) {
                    var buttonView = this.createChildView(formView._buildButton(descriptor, right));
                    right += (buttonView.get('layout.width') || 0) + 15;
                    this.pushObject(buttonView);
                }, this);
            }
        });
    },

    _buildButton: function(descriptor, right) {
        var properties = jQuery.extend({
            targetBinding: '^defaultTarget'
        }, descriptor);

        if (!properties.layout) {
            properties.layout = { width: this.get('buttonWidth'), right: right };
        }
        properties.layout.top = this._focusRingMargin;

        // if an explicit target is set, we don't want the default targetBinding to be used
        if (descriptor.target) {
            delete properties.targetBinding;
        }

        return Flame.ButtonView.extend(properties);
    },

    _buildValidationObservers: function(validationMessage) {
        if (Ember.isNone(validationMessage)) return {};

        var self = this;
        return {
            didInsertElement: function() {
                this._super();
                this.isValidDidChange(); // In case the field is initially invalid
            },

            isValidWillChange: function() {
                var errorView = this.get('_errorView');
                // We change from being invalid to valid and have an error view.
                if (errorView && !this.get('isValid')) {
                    errorView.remove();
                    this.set('_errorView', null);
                    self.set('_errorViews', self.get('_errorViews').without(errorView));
                }
            }.observesBefore('isValid'),

            isValidDidChange: function() {
                if (!this.get('isValid') && !this.get('_errorView')) {
                    var element = this.$();
                    var offset = element.offset();

                    // This is strictly not necessary, but currently you can save invalid form with enter, which then fails here
                    if (Ember.isNone(offset)) return;

                    var zIndex = Flame._zIndexCounter;
                    var errorMessage = validationMessage;
                    if (jQuery.isFunction(validationMessage)) {
                        // XXX This will only work with controls with the value in the 'value' property
                        errorMessage = validationMessage(this.get('value'));
                    }
                    var errorView = Flame.ErrorMessageView.create({
                        layout: { top: offset.top - 7, left: offset.left + element.outerWidth() - 4, width: null, height: null, zIndex: zIndex },
                        value: errorMessage,
                        parentView: self,
                        isVisibleBinding: 'parentView.isVisible'
                    }).append();

                    this.set('_errorView', errorView);
                    self.get('_errorViews').pushObject(errorView);
                }
            }.observes("isValid")
        };
    },

    _performTab: function(direction) {
        var view = Flame.keyResponderStack.current();
        // Text fields and text areas wrap around their Ember equivalent (which have the actual keyResponder status)
        if (view instanceof Ember.TextField || view instanceof Ember.TextArea) {
            view = view.get('parentView');
        }
        // Collect all controls that can have keyResponder status
        var controls = this.toArray().mapProperty('childViews')
            .reduce(function(a, b) { return a.concat(b); }).filter(function(view) {
            return view.get('acceptsKeyResponder') && view.get('isVisible');
        });
        if (Ember.isEmpty(controls)) return;

        // Pick out the next or previous control
        var index = controls.indexOf(view);
        index += direction;
        if (index < 0) {
            controls.objectAt(controls.get('length') - 1).becomeKeyResponder();
        } else if (index === controls.get('length')) {
            controls.objectAt(0).becomeKeyResponder();
        } else {
            controls.objectAt(index).becomeKeyResponder();
        }
    },

    insertTab: function() {
        this._performTab(1);
        return true;
    },

    insertBacktab: function() {
        this._performTab(-1);
        return true;
    },

    _buildControl: function(descriptor) {
        var property = descriptor.get('property');
        var object = this.get('object');
        var layout = { topPadding: 1, bottomPadding: 1, width: this.get('controlWidth') };
        if (descriptor.controlLayout) jQuery.extend(layout, descriptor.controlLayout);
        var settings = {
            layout: layout,
            value: Ember.computed.alias('parentView.parentView.object.%@'.fmt(property)),
            isValid: Ember.computed.notEqual('parentView.parentView.object.%@IsValid'.fmt(property), false),
            isDisabled: descriptor.isDisabled ? descriptor.isDisabled : Ember.computed.equal('parentView.parentView.object.%@IsDisabled'.fmt(property), true)
        };

        if (this.get('defaultFocus') === property) {
            settings.isDefaultFocus = true;
        }

        var validator = descriptor.get('validate');
        if (validator) {
            // Set up on-the-fly validation here.
            if (!object.get('validations')) { object.set('validations', {}); }
            object.setValidationFor(property, validator);
        }
        jQuery.extend(settings, this._buildValidationObservers(descriptor.get('validation')));
        var type = descriptor.get('type') || 'text';
        if (descriptor.options || descriptor.optionsBinding) type = 'select';

        // If a text field (or similar), emulate good old html forms that submit when hitting return by
        // clicking on the default button. This also prevents submitting of disabled forms.
        if (Ember.isNone(settings.action) && (type === 'text' || type === 'textarea' || type === 'password')) {
            var form = this;
            settings.fireAction = function() {
                var defaultButton = form.firstDescendantWithProperty('isDefault');
                if (defaultButton && defaultButton.simulateClick) {
                    defaultButton.simulateClick();
                }
            };
        }

        settings.classNames = settings.classNames || [];
        settings.classNames.push("form-view-" + type);

        return this._buildControlView(settings, type, descriptor);
    },

    _buildControlView: function(settings, type, descriptor) {
        switch (type) {
            case 'readonly':
                // readonly fields are selectable by default
                settings.isSelectable = descriptor.get('isSelectable') !== false;
                settings.attributeBindings = ['title'];
                settings.titleBinding = 'value';
                return Flame.LabelView.extend(settings);
            case 'text':
                settings.name = Ember.isNone(descriptor.name) ? descriptor.property : descriptor.name;
                if (descriptor.isAutocomplete) {
                    settings.autocompleteDelegate = descriptor.autocompleteDelegate;
                    return Flame.AutocompleteTextFieldView.extend(settings);
                }
                if (descriptor.setValueOnEachKeyUp === false) settings.setValueOnEachKeyUp = false;
                return Flame.TextFieldView.extend(settings);
            case 'textarea':
                settings.layout.height = descriptor.height || 70;
                return Flame.TextAreaView.extend(settings);
            case 'password':
                settings.isPassword = true;
                settings.name = Ember.isNone(descriptor.name) ? descriptor.property : descriptor.name;
                return Flame.TextFieldView.extend(settings);
            case 'html':
                return Flame.LabelView.extend(jQuery.extend(settings, {
                    escapeHTML: false,
                    formatter: function(val) {
                        return val === null ? '' : val;
                    }
                }));
            case 'checkbox':
                settings.title = descriptor.label;
                settings.isSelected = settings.value;
                delete settings.value;
                return Flame.CheckboxView.extend(settings);
            case 'select':
                settings.itemValueKey = descriptor.itemValueKey || "value";
                settings.subMenuKey = descriptor.subMenuKey || "subMenu";
                if (descriptor.optionsBinding) {
                    settings.itemTitleKey = descriptor.itemTitleKey || "name";
                    settings.itemsBinding = descriptor.optionsBinding;
                } else if (descriptor.options) {
                    settings.itemTitleKey = descriptor.itemTitleKey || "title";
                    if (Ember.typeOf(descriptor.options) === "function") {
                        settings.items = descriptor.options.apply(this);
                    } else {
                        settings.items = descriptor.options;
                    }
                }
                if (!descriptor.get('allowNew')) {
                    return Flame.SelectButtonView.extend(settings);
                } else {
                    return Flame.ComboBoxView.extend(settings);
                }
        }
        throw new Error('Invalid control type %@'.fmt(type));
    },

    willDestroyElement: function() {
        this.get('_errorViews').forEach(function(e) { e.remove(); });
    },

    isValid: function() {
        return this.get('_errorViews').length === 0;
    }.property('_errorViews.[]')
});

})();
(function() {
'use strict';

Flame.SplitViewDividerViewBase = Ember.Mixin.create(Flame.Statechart, {
    classNames: ['flame-split-view-divider'],
    initialFlameState: 'idle',

    idle: Flame.State.extend({
        mouseDown: function(event) {
            var parentView = this.get('owner.parentView');
            if (!parentView.get('allowResizing')) return false;
            parentView.startResize(event, this);
            this.gotoFlameState('resizing');
            return true;
        },

        touchStart: function(event) {
            // Normalize the event and send it to mouseDown
            this.mouseDown(this.normalizeTouchEvents(event));
            return true;
        },

        doubleClick: function(event) {
            var parentView = this.get('owner.parentView');
            if (!parentView.get('allowResizing')) return false;
            parentView.toggleCollapse(event);
            return true;
        }
    }),

    resizing: Flame.State.extend({
        mouseMove: function(event) {
            this.get('owner.parentView').resize(event);
            return true;
        },

        touchMove: function(event) {
            // Don't scroll the page while we're doing this
            event.preventDefault();
            // Normalize the event and send it to mouseDown
            this.mouseMove(this.normalizeTouchEvents(event));
            return true;
        },

        mouseUp: Flame.State.gotoFlameState('idle'),
        touchEnd: Flame.State.gotoFlameState('idle'),

        exitState: function() {
            var parentView = this.get('owner.parentView');
            if (parentView.endResize) {
                parentView.endResize();
            }
        }
    })
});

})();
(function() {
'use strict';


Flame.SplitView = Flame.View.extend({
    allowResizing: true,
    dividerThickness: 7,
    dividerView: Flame.View.extend(Flame.SplitViewDividerViewBase),

    didInsertElement: function() {
        this._updateLayout();
    }
});

})();
(function() {
'use strict';



/**
  HotizontalSplitView divides the current view between topView and bottomView using a horizontal
  dividerView.
*/

Flame.HorizontalSplitView = Flame.SplitView.extend({
    classNames: ['flame-horizontal-split-view'],
    childViews: ['topView', 'dividerView', 'bottomView'],
    topHeight: 100,
    bottomHeight: 100,
    minTopHeight: 0,
    minBottomHeight: 0,
    flex: 'bottom',

    _unCollapsedTopHeight: undefined,
    _unCollapsedBottomHeight: undefined,
    _resizeStartY: undefined,
    _resizeStartTopHeight: undefined,
    _resizeStartBottomHeight: undefined,

    init: function() {

        this._super();

        if (this.get('flex') === 'bottom') this.set('bottomHeight', undefined);
        else this.set('topHeight', undefined);
    },

    _updateLayout: function() {
        var topView = this.get('topView');
        var dividerView = this.get('dividerView');
        var bottomView = this.get('bottomView');

        var totalHeight = this.$().innerHeight();
        var dividerThickness = this.get('dividerThickness');
        var topHeight = this.get('flex') === 'bottom' ? this.get('topHeight') : undefined;
        var bottomHeight = this.get('flex') === 'top' ? this.get('bottomHeight') : undefined;
        if (topHeight === undefined && bottomHeight !== undefined && totalHeight !== null && totalHeight !== 0) topHeight = totalHeight - bottomHeight - dividerThickness;
        if (bottomHeight === undefined && topHeight !== undefined && totalHeight !== null && totalHeight !== 0) bottomHeight = totalHeight - topHeight - dividerThickness;

        if (typeof topHeight === 'number' && topHeight < this.get('minTopHeight')) {
            bottomHeight += topHeight - this.get('minTopHeight');
            topHeight = this.get('minTopHeight');
        }
        if (typeof bottomHeight === 'number' && bottomHeight < this.get('minBottomHeight')) {
            topHeight += bottomHeight - this.get('minBottomHeight');
            bottomHeight = this.get('minBottomHeight');
        }
        this.set('topHeight', topHeight);
        this.set('bottomHeight', bottomHeight);

        if (this.get('flex') === 'bottom') {
            this._setDimensions(topView, 0, topHeight, '');
            this._setDimensions(dividerView, topHeight, dividerThickness, '');
            this._setDimensions(bottomView, topHeight + dividerThickness, '', 0);
        } else {
            this._setDimensions(topView, 0, '', bottomHeight + dividerThickness);
            this._setDimensions(dividerView, '', dividerThickness, bottomHeight);
            this._setDimensions(bottomView, '', bottomHeight, 0);
        }
    }.observes('topHeight', 'bottomHeight', 'minTopHeight', 'minBottomHeight'),

    _setDimensions: function(view, top, height, bottom) {
        view.get('layout').setProperties({
            left: 0,
            height: height,
            right: 0,
            top: top,
            bottom: bottom
        });
        view.updateLayout();
    },

    toggleCollapse: function(event) {
        if (!this.get('allowResizing')) return;

        if (this.get('flex') === 'bottom') {
            if (this.get('topHeight') === this.get('minTopHeight') && this._unCollapsedTopHeight !== undefined) {
                this.set('topHeight', this._unCollapsedTopHeight);
            } else {
                this._unCollapsedTopHeight = this.get('topHeight');
                this.set('topHeight', this.get('minTopHeight'));
            }
        } else {
            if (this.get('bottomHeight') === this.get('minBottomHeight') && this._unCollapsedBottomHeight !== undefined) {
                this.set('bottomHeight', this._unCollapsedBottomHeight);
            } else {
                this._unCollapsedBottomHeight = this.get('bottomHeight');
                this.set('bottomHeight', this.get('minBottomHeight'));
            }
        }
    },

    startResize: function(event) {
        this._resizeStartY = event.pageY;
        this._resizeStartTopHeight = this.get('topHeight');
        this._resizeStartBottomHeight = this.get('bottomHeight');
    },

    resize: function(event) {
        if (this.get('flex') === 'bottom') {
            this.set('topHeight', this._resizeStartTopHeight + (event.pageY - this._resizeStartY));
        } else {
            this.set('bottomHeight', this._resizeStartBottomHeight - (event.pageY - this._resizeStartY));
        }
    }
});

})();
(function() {
'use strict';

Flame.ListItemView = Flame.View.extend({
    useAbsolutePosition: false,
    classNames: ['flame-list-item-view'],
    classNameBindings: ['isSelected', 'parentView.allowReordering', 'isDragged'],
    isSelected: false,
    _parentViewOnMouseDown: undefined,
    displayProperties: ['content'],
    acceptsKeyResponder: false,
    childListView: null,

    mouseMove: function(evt) {
        if (this._parentViewOnMouseDown !== undefined) {
            return this._parentViewOnMouseDown.mouseMove(evt);
        } else {
            return false;
        }
    },

    mouseDown: function(evt) {
        // As a result of a drag operation, this view might get detached from the parent, but we still need to
        // relay the mouseUp event to that parent, so store it here into _parentViewOnMouseDown.
        this._parentViewOnMouseDown = this.get('parentView');
        return this._parentViewOnMouseDown.mouseDownOnItem(this.get('contentIndex'), evt);
    },

    mouseUp: function(evt) {
        if (this._parentViewOnMouseDown !== undefined) {
            var parentView = this._parentViewOnMouseDown;
            this._parentViewOnMouseDown = undefined;
            return parentView.mouseUpOnItem(evt);
        } else {
            return false;
        }
    },

    // We don't have the normalize function available, so we'll pass
    // these events to the relevant parent view handlers.
    touchMove: function(evt) {
        if (this._parentViewOnMouseDown !== undefined) {
            return this._parentViewOnMouseDown.touchMove(evt);
        } else {
            return false;
        }
    },

    touchStart: function(evt) {
        // The same caveats apply as in mouseDown: store the parentView and hand the event up to it
        this._parentViewOnMouseDown = this.get('parentView');
        return this._parentViewOnMouseDown.mouseDownOnItem(this.get('contentIndex'), evt);
    },

    touchEnd: function(evt) {
        if (this._parentViewOnMouseDown !== undefined) {
            var parentView = this._parentViewOnMouseDown;
            this._parentViewOnMouseDown = undefined;
            return parentView.mouseUpOnItem(evt);
        } else {
            return false;
        }
    }
});

})();
(function() {
'use strict';


Flame.LazyListViewStates = {};

Flame.LazyListViewStates.MouseIsDown = Flame.State.extend({
    xOffset: null,
    yOffset: null,

    exitState: function() { this.xOffset = this.yOffset = null; },

    mouseMove: function(event) {
        var owner = this.get('owner');
        var parentView = owner.get('parentView');
        if (!parentView.get('allowReordering') || parentView.disableReordering(event)) return true;
        if (this.xOffset === null) {
            this.xOffset = event.pageX;
            this.yOffset = event.pageY;
        }
        // Only start dragging if we move more than 2 pixels vertically
        if (Math.abs(event.pageY - this.yOffset) < 3) return true;

        var offset = owner.$().offset();
        this.set('owner.xOffset', this.xOffset - offset.left);
        this.set('owner.yOffset', this.yOffset - offset.top);
        this.gotoFlameState('dragging');
        return true;
    },

    mouseUp: function() {
        var owner = this.get('owner');
        var parentView = owner.get('parentView');
        parentView.selectIndex(owner.get('contentIndex'));
        this.gotoFlameState('idle');
        return true;
    }
});

Flame.LazyListItemView = Flame.ListItemView.extend(Flame.Statechart, {
    layout: { left: 0, right: 0, height: 25 },
    initialFlameState: 'idle',

    init: function() {
        // Don't rerender the item view when the content changes
        this.set('displayProperties', []);
        this._super();
    },

    mouseDown: function(event) {
        this.invokeStateMethod('mouseDown', event);
        return true;
    },

    mouseMove: function(event) {
        this.invokeStateMethod('mouseMove', event);
        return true;
    },

    mouseUp: function(event) {
        this.invokeStateMethod('mouseUp', event);
        return true;
    },

    idle: Flame.State.extend({
        mouseDown: function() {
            this.gotoFlameState('mouseIsDown');
        }
    }),

    mouseIsDown: Flame.LazyListViewStates.MouseIsDown,

    dragging: Flame.State.extend({
        clone: null,
        indicator: null,
        scrollViewOffset: null, // Cache this for performance reasons

        enterState: function() {
            var owner = this.get('owner');
            var listView = owner.get('parentView');
            if (owner.willStartDragging) owner.willStartDragging();
            var $listView = listView.$();
            this.set('owner.isDragged', true);
            this.scrollViewOffset = listView.get('parentView').$().offset();
            this.clone = this.$().safeClone();
            this.clone.addClass('dragged-clone');
            this.clone.draggingInfo = { currentIndex: this.get('owner.contentIndex') };
            this.indicator = jQuery('<div class="indicator"><img src="%@"></div>'.fmt(Flame.image('reorder_indicator.svg'))).hide();
            $listView.append(this.clone);
            $listView.append(this.indicator);
        },

        exitState: function() {
            this.set('owner.isDragged', false);
            this.finishDragging();
            this.clone.remove();
            this.clone = null;
            this.indicator.remove();
            this.indicator = null;
        },

        mouseMove: function(event) {
            var owner = this.get('owner');
            var listView = owner.get('parentView');
            this.listViewPosition = listView.$().position();
            var scrollView = listView.get('parentView');
            var newTop = event.pageY - owner.get('yOffset') + scrollView.lastScrollY - (scrollView.lastScrollY + this.listViewPosition.top) - this.scrollViewOffset.top;
            var newLeft = event.pageX - this.scrollViewOffset.left - owner.get('xOffset');
            this.didDragItem(newTop, newLeft);
            return true;
        },

        mouseUp: function() {
            this.gotoFlameState('idle');
            return true;
        },

        didDragItem: function(newTop, newLeft) {
            if (this.get('owner.parentView.constrainDragginToXAxis')) {
                this.clone.css({top: newTop});
            } else {
                this.clone.css({top: newTop, left: newLeft});
            }
            var itemHeight = this.get('owner.parentView.itemHeight');
            var index = Math.ceil(newTop / itemHeight);
            this.clone.draggingInfo = this.get('owner.parentView').indexForMovedItem(this.clone.draggingInfo, index, this.get('owner.contentIndex'), newLeft);
            var height = this.clone.draggingInfo.currentIndex * itemHeight;
            this.indicator.css({ top: height - 1 + 'px', 'margin-left': this.clone.draggingInfo.level * 20 + 7 + 'px' });
            this.indicator.show();
        },

        finishDragging: function() {
            this.get('owner.parentView').moveItem(this.get('owner.contentIndex'), this.clone.draggingInfo);
        }
    })
});

})();
(function() {
'use strict';

/**
  This helper class hides the ugly details of doing dragging in list views and tree views.

  One challenge in the implementation is how to designate a specific potential drop position.
  For a list of items, a natural choice would be to use an insert position: e.g. 0 would mean
  insert as the first item, 5 would mean insert as the fifth item. We can extend this for
  tree views by using an array of indexes: [2, 1, 4] would mean take the child number 2 from
  the topmost list, then child number 1 from the next, and insert the item as the fourth
  child of that. But there's an added complexity: When the item being moved is removed from
  its parent, all other items inside that parent shift, potentially changing the meaning of a
  path array. This means that while calculating a potential drop position, and when actually
  doing the insertion, positions potentially have a different meaning. It can be taken into
  account but it results into convoluted code.

  A better approach is to use unambiguous drop position designators. Such a designator can be
  constructed by naming an existing item in the tree (identified with a path *before* the
  item being moved is removed), and stating the insertion position relative to that. We need
  three insertion position indicators: before, after and inside (= as the first child, needed
  when there are currently no children at all). We can represent those as letters 'b', 'a' and
  'i'. This is handled in the nested Path class.

  In order to support dragging, items on all levels must provide a property 'childListView'
  that returns the view that has as its children all the items on the next level. If the
  object has nothing underneath it, it must return null.
  This is useful when the item views are complex and do not directly contain their child
  items as their only child views.

  See for example the following tree:

          A
         /|\
        / | \
       Z  X  Y
          |   \
          V    3
         / \
        2   4

  Here V is not ItemView but others are. Then A and Y should return itself, X should return V, and
  1 to 4 and Z should return null.
*/

Flame.ListViewDragHelper = Ember.Object.extend({
    listView: undefined,
    lastPageX: undefined,
    yOffset: undefined,
    itemPath: undefined,
    lastTargetContent: null,

    clone: undefined,
    mouseMoveCounter: 0,

    // Creates a clone of the dragged element and dims the original
    initReorder: function() {
        var newItemPath = Flame.ListViewDragHelper.Path.create({array: this.itemPath, root: this.listView});
        this.itemPath = newItemPath;
        // XXX very ugly...
        this.reorderCssClass = this.isTree() ? '.flame-tree-item-view-container' : '.flame-list-item-view';

        var view = this.itemPath.getView();

        // Don't set the opacity by using element-style but instead set appropriate class. Thus IE filters disappear
        // when they're no longer required for opacity. Plus this automatically restores the original opacity to the
        // element.
        view.set("isDragged", true);
        var element = view.$();
        var clone = element.clone();

        if (element.attr('id')) clone.attr('id', element.attr('id') + "_drag");
        clone.addClass('is-dragged-clone');
        clone.find("*").each(function() {
            if (this.id) this.id = this.id + "_drag";
        });
        clone.appendTo(this.get('listView').$());

        clone.css('opacity', 0.8);

        this.clone = clone;
        this._updateCss();

        // As the clone is not linked to any Ember view, we have to add custom event handlers on it
        var listView = this.get('listView');
        clone.mousemove(function(event) {
            listView.mouseMove.apply(listView, arguments);
            return true;
        });
        clone.mouseup(function(event) {
            listView.mouseUp.apply(listView, arguments);
            return true;
        });
    },

    // Moves the clone to match the current mouse position and moves the dragged item in the list/tree if needed
    updateDisplay: function(event, scheduled) {
        // This logic discards mouseMove events scheduled by the scrolling logic in case there's been a real mouseMove event since scheduled
        if (scheduled === undefined) this.mouseMoveCounter++;
        else if (scheduled <= this.mouseMoveCounter) return;

        this._updateDraggingCloneAndScrollPosition(event);
        var newPath = this._resolveNewPath(event.pageX, event.pageY);

        if (newPath && !this.itemPath.equals(newPath)) {
            var view = this.itemPath.getView();
            this._moveItem(this.itemPath, newPath);
            this.itemPath = this._resolvePath(view);
            // CSS can only be updated once all the rendering has been done
            Ember.run.scheduleOnce('afterRender', this, this._updateCss);
            this.lastPageX = event.pageX;  // Reset the reference point for horizontal movement every time the item is moved
        }
    },

    finishReorder: function() {
        var itemPathView = this.itemPath.getView();
        this.get('listView').didReorderContent(itemPathView.get('parentView.content'));
        itemPathView.set('isDragged', false);
        var clone = this.clone;
        Ember.run.schedule('afterRender', function() {
            // We can't remove the clone right away, we still need to get its
            // position earlier on in the afterRender queue.
            if (clone) clone.remove(); // Remove the clone holding the clones from the DOM
        });
    },

    // Updates the css classes and 'left' property of the clone and its children, needed for fixing indentation
    // to match the current item position in a tree view.
    _updateCss: function() {
        var draggedElement = this.itemPath.getView().$();
        if (draggedElement) {
            var rootOffsetLeft = this.clone.offsetParent().offset().left;

            this.clone.attr('class', draggedElement.attr('class') + ' is-dragged-clone');
            this.clone.css('left', draggedElement.offset().left - rootOffsetLeft);

            var originals = this.itemPath.getView().$().find('.flame-tree-item-view', '.flame-tree-view');
            var children = this.clone.find('.flame-tree-item-view', '.flame-tree-view');
            children.each(function(i) {
                var element = jQuery(this), origElement = jQuery(originals.get(i));
                element.attr('class', origElement.attr('class'));
                rootOffsetLeft = element.offsetParent().offset().left;
                element.css('left', origElement.offset().left - rootOffsetLeft);
            });
        }
    },

    // Moves the dragged element in the list/tree to a new location, possibly under a new parent
    _moveItem: function(sourcePath, targetPath) {
        // This is really hacky, we need to make sure that when we alter the content
        // array, the array observers do nothing (since we also manually remove the childView).
        var isDragging = this.get('listView.isDragging');
        this.set('listView.isDragging', true);

        var view = sourcePath.getView();
        var contentItem = view.get('content');
        var sourceParent = view.get('parentView');
        var sourceContent = sourceParent.get('content');
        var element = view.$();

        var targetView = targetPath.getView();
        var targetElement = targetView.$();
        var targetParent = targetPath.position === 'i' ? targetPath.getNestedListView() : targetView.get('parentView');
        var targetContent = targetParent.get('content');

        // First remove the view, the content item and the DOM element from their current parent.
        // If moving inside the same parent, use a special startMoving+endMoving API provided by
        // Flame.SortingArrayProxy to protect against non-modifiable arrays (the sort property is
        // still updated).
        if (sourceContent === targetContent && sourceContent.startMoving) sourceContent.startMoving();
        sourceParent.removeObject(view);
        sourceContent.removeObject(contentItem);
        sourceParent._updateContentIndexes();
        element.detach();

        // Then insert them under the new parent, at the correct position
        var contentIndex = targetView.get('contentIndex'), targetIndex;
        if (targetPath.position === 'b') {
            element.insertBefore(targetElement);
            targetIndex = contentIndex;
        } else if (targetPath.position === 'a') {
            element.insertAfter(targetElement);
            targetIndex = contentIndex + 1;
        } else if (targetPath.position === 'i') {
            targetElement.find('.flame-list-view').first().prepend(element);
            targetIndex = 0;
        } else throw new Error('Invalid insert position ' + targetPath.position);
        view.set('_parentView', targetParent);
        targetParent.insertAt(targetIndex, view);
        targetContent.insertAt(targetIndex, contentItem);

        if (sourceContent === targetContent && sourceContent.endMoving) sourceContent.endMoving();
        // We need to do this manually because ListView suppresses the childViews observers while dragging,
        // so that we can do the entire DOM manipulation ourselves here without the list view interfering.
        targetParent._updateContentIndexes();

        this.set('listView.isDragging', isDragging);
    },

    isTree: function() {
        return this.listView instanceof Flame.TreeView;  // XXX ugly
    },

    // Considering the current drag position, works out if the dragged element should be moved to a new location
    // in the list/tree. If dragging in a ListView, we compare against the .flame-list-item-view elements. If in a
    // TreeView, we need to compare against .flame-tree-item-view-container elements, that's what contains the item
    // label (and excludes possible nested tree views).
    _resolveNewPath: function(pageX, pageY) {
        var draggedView = this.itemPath.getView();
        var draggedElement = draggedView.$();
        var itemElements = this.get('listView').$().find(this.reorderCssClass);
        // XXX very ugly
        var currentElement = this.isTree() ? draggedElement.children(this.reorderCssClass).first() : draggedElement;
        var startIndex = itemElements.index(currentElement);


        var cloneTop = this.clone.offset().top;
        var cloneBottom = cloneTop + this.clone.outerHeight();
        var currentDy = cloneTop - draggedElement.offset().top;

        var direction = currentDy > 0 ? 1 : -1;  // Is user dragging the item up or down from its current position in the list?
        var i = startIndex + direction;
        var len = itemElements.length;
        var newIndex = startIndex;

        while (i >= 0 && i < len) {
            var testElement = jQuery(itemElements[i]);
            if (testElement.closest('.is-dragged-clone').length > 0) break;  // Ignore the clone
            if (testElement.is(':visible') && testElement.closest(draggedElement).length === 0) {
                var thresholdY = testElement.offset().top + testElement.outerHeight() * (0.5 + direction * 0.2);

                if ((direction > 0 && cloneBottom > thresholdY) || (direction < 0 && cloneTop < thresholdY)) {
                    newIndex = i;
                } else {
                    break;
                }
            }
            i += direction;
        }

        var targetView = Ember.View.views[jQuery(itemElements[newIndex]).closest('.flame-list-item-view').attr('id')];
        var path = this._resolvePath(targetView);

        // Path defaults to inside (i), confusingly _resolveNewLevel can also mangle position!
        var canDropInside = direction > 0 && targetView.get('hasChildren') && targetView.get('isExpanded') && !this._pathInvalid(draggedView, path);
        if (!canDropInside) {
            if (direction > 0) {
                path.position = 'a';  // a for after
            } else {
                path.position = 'b';  // b for before
            }
        }

        // Finally we need to see if the new location is a last child in a nested list view, or just after an open 'folder'.
        // If so, the vertical position is not enough to unambiguously define the desired target location, we have to also
        // check horizontal movement to decide which level to put the dragged item on.
        path = this._resolveNewLevel(draggedView, targetView, path, pageX);
        return this._pathInvalid(draggedView, path) ? null : path;
    },

    _resolveNewLevel: function(draggedView, targetView, path, pageX) {
        var xDiff = pageX - this.lastPageX;
        var xStep = 10;  // TODO obtain the real horiz. difference between the DOM elements on the different levels somehow...

        // If as the last item of a nested list, moving left moves one level up (placing immediately after current parent), OR
        // if the current level isn't valid, try and see if there is a valid drop one level up
        while ((xDiff < -xStep || this._pathInvalid(draggedView, path)) && (path.position === 'a' || this.itemPath.equals(path)) &&
               path.array.length > 1 && targetView.get('contentIndex') === targetView.get('parentView.length') - 1) {
            xDiff += xStep;
            path = path.up();
            targetView = path.getView();
        }

        // If previous item has children and is expanded, moving right moves the item as the last item inside that previous one, OR
        // if current level isnt valid and there is a valid preceding cousin, try that instead (notice this alters the position!)
        var precedingView;
        while ((xDiff > xStep || this._pathInvalid(draggedView, path)) && (path.position !== 'i' || this.itemPath.equals(path)) &&
               (precedingView = this._getPrecedingView(targetView)) !== undefined &&
               precedingView !== draggedView && precedingView.get('hasChildren') && precedingView.get('isExpanded') && !this._pathInvalid(draggedView, this._resolvePath(precedingView).down())) {
            xDiff -= xStep;
            path = this._resolvePath(precedingView).down();
            targetView = path.getView();
        }

        return path;
    },

    _pathInvalid: function(draggedView, targetPath) {
        var itemDragged = draggedView.get('content');
        var dropTarget = targetPath.getView().get('content');
        var newParent = null;
        if (targetPath.position === 'i') {
            newParent = dropTarget;
        } else {
            var newParentItemView = targetPath.up().getView();
            if (newParentItemView) {
                newParent = newParentItemView.get('content');
            }
        }
        var isValid = this.get('listView').isValidDrop(itemDragged, newParent, dropTarget);
        return !isValid;
    },

    _getPrecedingView: function(view) {
        return view.get('contentIndex') > 0 ? view.get('parentView').objectAt(view.get('contentIndex') - 1) : undefined;
    },

    _resolvePath: function(view) {
        var pathArray = [];
        var listView = view.get('parentView');

        do {
            pathArray.insertAt(0, view.get('contentIndex'));
            listView = view.get('parentView');
        } while (listView.get('isNested') && (view = listView.get('parentView')) !== undefined);

        return Flame.ListViewDragHelper.Path.create({array: pathArray, root: this.listView});
    },

    _updateDraggingCloneAndScrollPosition: function(event) {
        var domParent = this.get('listView').$();
        if (domParent.hasClass('is-nested')) domParent = domParent.offsetParent();  // If nested list in a tree, grab the topmost
        var scrollTop = domParent.scrollTop();
        var parentHeight = domParent.innerHeight();
        var newTop = event.pageY - this.yOffset - domParent.offset().top + scrollTop;

        // Check top and bottom limits to disallow moving beyond the content area of the list view
        if (newTop < 0) newTop = 0;
        var height = this.clone.outerHeight();
        var scrollHeight = domParent[0].scrollHeight;  // See http://www.yelotofu.com/2008/10/jquery-how-to-tell-if-youre-scroll-to-bottom/
        if (newTop + height > scrollHeight) newTop = scrollHeight - height;

        this.clone.css({ position: 'absolute', right: 0, top: newTop });

        // See if we should scroll the list view either up or down (don't scroll if overflow is not auto, can cause undesired tiny movement)
        if (domParent.css('overflow') === 'auto') {
            var topDiff = scrollTop - newTop;
            if (topDiff > 0) {
                domParent.scrollTo('-=%@px'.fmt(Math.max(topDiff / 5, 1)));
            }
            var bottomDiff = (newTop + height) - (scrollTop + parentHeight);
            if (bottomDiff > 0) {
                domParent.scrollTo('+=%@px'.fmt(Math.max(bottomDiff / 5, 1)));
            }
            if (topDiff > 0 || bottomDiff > 0) {  // If scrolled, schedule an artificial mouseMove event to keep scrolling
                Ember.run.scheduleOnce('afterRender', this, this.updateDisplay, event, this.mouseMoveCounter);
            }
        }
    }
});

/**
  A helper class for the drag helper, represents a potential insert location in a list/tree.
  See docs for ListViewDragHelper above for details.
*/
Flame.ListViewDragHelper.Path = Ember.Object.extend({
    array: [],
    position: 'i',
    root: null,

    getView: function() {
        var view, i, len = this.array.length, listView = this.root;
        for (i = 0; i < len; i++) {
            var index = this.array[i];
            view = listView.objectAt(index);
            if (i < len - 1) {
                listView = view.get('childListView');
            }
        }
        return view;
    },

    getNestedListView: function() {
        return this.getView().get('childListView');
    },

    up: function() {
        var newArray = this.array.slice(0, this.array.length - 1);
        return Flame.ListViewDragHelper.Path.create({array: newArray, position: 'a', root: this.root});
    },

    down: function() {
        var newArray = Ember.copy(this.array);
        var newPosition;
        var nestedChildrenCount = this.getNestedListView().get('content.length');
        if (nestedChildrenCount > 0) {
            newArray.push(nestedChildrenCount - 1);
            newPosition = 'a';
        } else {
            newPosition = 'i';
        }
        return Flame.ListViewDragHelper.Path.create({array: newArray, position: newPosition, root: this.root});
    },

    // Ignores the position letter
    equals: function(other) {
        var len1 = this.array.length, len2 = other.array.length;
        if (len1 !== len2) return false;
        for (var i = 0; i < len1; i++) {
            if (this.array[i] !== other.array[i]) return false;
        }
        return true;
    }
});

})();
(function() {
'use strict';





/**
  Displays a list of items. Allows reordering if allowReordering is true.

  The reordering support is probably the most complicated part of this. It turns out that when reordering items,
  we cannot allow any of the observers on the content or childViews to fire, as that causes childViews to be
  updated, which causes flickering. Thus we update the DOM directly, and sneakily update the content and childViews
  arrays while suppressing the observers.
*/

Flame.ListView = Flame.CollectionView.extend(Flame.Statechart, {
    classNames: ['flame-list-view'],
    classNameBindings: ['isFocused'],
    acceptsKeyResponder: true,
    allowSelection: true,
    allowReordering: true,
    selection: undefined,
    initialFlameState: 'idle',
    reorderDelegate: null,
    _minimumDeltaToStartDrag: 4,
    init: function() {
        this._super();
        this._selectionDidChange();
    },

    itemViewClass: Flame.ListItemView.extend({
        templateContext: function(key, value) {
            return value !== undefined ? value : Ember.get(this, 'content');
        }.property('content'),
        template: Ember.computed.alias('parentView.template'),
        handlebars: '{{view.title}}'
    }),

    selectIndex: function(index) {
        if (!this.get('allowSelection')) return false;
        var content = this.get('content');
        if (content) {
            var childView = this.objectAt(index);
            if (childView && childView.get('isVisible') && childView.get('allowSelection') !== false) {
                var selection = content.objectAt(index);
                this.set('selection', selection);
                return true;
            }
        }
        return false;
    },

    // direction -1 for up, 1 for down
    // returns true if selection did change
    changeSelection: function(direction) {
        var content = this.get('content');
        var selection = this.get('selection');
        var index = content.indexOf(selection);
        var newIndex = index + direction, len = content.get('length');
        while (newIndex >= 0 && newIndex < len) {  // With this loop we jump over items that cannot be selected
            if (this.selectIndex(newIndex)) return true;
            newIndex += direction;
        }
        return false;
    },

    _selectionWillChange: function() {
        this._setIsSelectedStatus(this.get('selection'), false);
    }.observesBefore('selection'),

    _selectionDidChange: function() {
        this._setIsSelectedStatus(this.get('selection'), true);
    }.observes('selection'),

    _setIsSelectedStatus: function(contentItem, status) {
        if (contentItem) {
            var index = (this.get('content') || []).indexOf(contentItem);
            if (index >= 0) {
                var child = this.objectAt(index);
                if (child) child.set('isSelected', status);
            }
        }
    },

    // If items are removed or reordered, we must update the contentIndex of each childView to reflect their current position in the list
    _updateContentIndexes: function() {
        var len = this.get('length');
        for (var i = 0; i < len; i++) {
            var childView = this.objectAt(i);
            if (childView) childView.set('contentIndex', i);
        }
        // In case the child views are using absolute positioning, also their positions need to be updated,
        // otherwise they don't appear to move anywhere.
        this.consultLayoutManager();
    },

    didReorderContent: function(content) {
        var delegate = this.get('reorderDelegate');
        if (delegate) {
            Ember.run.next(function() {
                delegate.didReorderContent(content);
            });
        }
    },

    isValidDrop: function(itemDragged, newParent, dropTarget) {
        var delegate = this.get('reorderDelegate');
        if (delegate && delegate.isValidDrop) {
            return delegate.isValidDrop(itemDragged, newParent, dropTarget);
        } else {
            return true;
        }
    },

    // Overridden in TreeView
    rootTreeView: function() {
        return this;
    }.property().volatile(),

    arrayWillChange: function(content, start, removedCount) {
        if (!this.get('rootTreeView.isDragging')) {
            return this._super.apply(this, arguments);
        }
    },

    arrayDidChange: function(content, start, removed, added) {
        if (!this.get('rootTreeView.isDragging')) {
            var result = this._super.apply(this, arguments);
            this._updateContentIndexes();
            return result;
        }
    },

    childViewsWillChange: function() {
        if (!this.get('rootTreeView.isDragging')) {
            this._super.apply(this, arguments);
        }
    },

    childViewsDidChange: function() {
        if (!this.get('rootTreeView.isDragging')) {
            this._super.apply(this, arguments);
        }
    },

    // Override if needed, return false to disallow reordering that particular item
    allowReorderingItem: function(itemIndex) {
        return true;
    },

    idle: Flame.State.extend({
        moveUp: function() { return this.get('owner').changeSelection(-1); },
        moveDown: function() { return this.get('owner').changeSelection(1); },

        mouseDownOnItem: function(itemIndex, event) {
            var owner = this.get('owner');
            owner.selectIndex(itemIndex);

            // Store some information in case user starts dragging (i.e. moves mouse with the button pressed down),
            // but only if reordering is generally allowed for this list view and for the particular item
            if (owner.get('allowReordering') && itemIndex !== undefined) {
                if (owner.allowReorderingItem(itemIndex)) {
                    var childView = owner.objectAt(itemIndex);
                    owner.set('dragHelper', Flame.ListViewDragHelper.create({
                        listView: owner,
                        lastPageX: event.pageX,
                        lastPageY: event.pageY,
                        yOffset: event.pageY - childView.$().offset().top,
                        itemPath: [itemIndex]
                    }));
                }
            }

            this.gotoFlameState('mouseButtonPressed');

            // Have to always return true here because the user might start dragging, and if so, we need the mouseMove events.
            return true;
        },

        enterState: function() {
            this.get('owner').set('dragHelper', undefined);  // In case dragging was allowed but not started, clear the drag data
        }
    }),

    _shouldStartDragging: function(event) {
        var dragHelper = this.get('dragHelper');
        if (dragHelper) {
            // Only enter reordering state if it was allowed, indicated by the presence of dragHelper and then only if
            // we've moved the mouse enough from the start.
            var deltaX = Math.abs(dragHelper.get("lastPageX") - event.pageX);
            var deltaY = Math.abs(dragHelper.get("lastPageY") - event.pageY);
            return deltaX > this._minimumDeltaToStartDrag || deltaY > this._minimumDeltaToStartDrag;
        }
        return false;
    },

    // This is here so that we can override the behaviour in tree views
    startReordering: function(dragHelper, event) {
        dragHelper.set('listView', this);
        this.set('dragHelper', dragHelper);
        this.gotoFlameState('reordering');
        return this.mouseMove(event);  // Handle also this event in the new state
    },

    mouseButtonPressed: Flame.State.extend({
        mouseUpOnItem: Flame.State.gotoFlameState('idle'),
        mouseUp: Flame.State.gotoFlameState('idle'),

        mouseMove: function(event) {
            var owner = this.get('owner');
            var dragHelper = owner.get('dragHelper');
            if (owner._shouldStartDragging(event)) {
                this.gotoFlameState('idle');
                owner.startReordering(dragHelper, event);
            }
            return true;
        },

        touchEnd: Flame.State.gotoFlameState('idle'),

        touchMove: function(event) {
            this.mouseMove(this.normalizeTouchEvents(event));
            return true;
        }
    }),

    reordering: Flame.State.extend({
        mouseMove: function(event, view, scheduled) {
            var dragHelper = this.get('owner.dragHelper');
            Ember.run.scheduleOnce('afterRender', dragHelper, 'updateDisplay', event);
            return true;
        },

        mouseUp: Flame.State.gotoFlameState('idle'),

        touchMove: function(event) {
            this.mouseMove(this.normalizeTouchEvents(event));
            return true;
        },

        touchEnd: Flame.State.gotoFlameState('idle'),

        // Start reorder drag operation
        enterState: function() {
            var owner = this.get('owner');
            owner.get('dragHelper').initReorder();
            owner.set('isDragging', true);
        },

        // When exiting the reorder state, we need to hide the dragged clone and restore the look of the dragged child view
        exitState: function() {
            var owner = this.get('owner');
            owner.get('dragHelper').finishReorder();
            owner.set('dragHelper', undefined);
            owner.set('isDragging', false);
        }
    })
});

})();
(function() {
'use strict';



/**
  Flame.ListView has the problem that it creates and renders a view for each and
  every item in the collection that it displays. For large collections this will be
  terribly slow and inefficient.

  Flame.LazyListView is a drop-in alternative for Flame.ListView that only renders
  item views that are visible within the Flame.ScrollView this list view is contained
  in. Additionally item views will be recycled, i.e. item views that scroll off the
  visible area will be reused to show items that have become visible by scrolling.

  To make the scrolling as smooth as possible, a small number of extra views is
  rendered above and below the visible area. This number of views can be configured
  with the `bufferSize` property. Setting this to 10 will render 5 extra views on
  top and 5 on the bottom.

  Flame.LazyListView currently only works correctly when used within a Flame.ScrollView.

  TODO * variable row height
       * spacing between items

  @class LazyListView
  @extends ListView
*/

Flame.LazyListView = Flame.ListView.extend({
    classNames: ['flame-lazy-list-view'],
    /** The default height of one row in the LazyListView */
    itemHeight: 25,
    bufferSize: 10,
    constrainDragginToXAxis: false,
    _suppressObservers: false,

    _lastScrollHeight: undefined,
    _lastScrollTop: undefined,
    _recycledViews: null, // set in init

    init: function() {
        this._super();
        this._recycledViews = {};
    },

    arrayWillChange: function() {},

    arrayDidChange: function(content, start, removed, added) {
        if (content && !this._suppressObservers) {
            // Not the most efficient thing to do, but it does make things a lot
            // less complicated. Since item views are supposed to render quickly
            // and because only the visible rows are rendered, this is quite ok though.
            this.fullRerender();
        }
    },

    /** Do a full rerender of the ListView */
    fullRerender: function() {
        // Recycle any currently rendered views
        var self = this;
        this.forEachChildView(function(view) {
            if (typeof view.get('contentIndex') !== 'undefined') {
                self._recycleView(view);
            }
        });
        this.numberOfRowsChanged();
        this.didScroll(this._lastScrollHeight, this._lastScrollTop);
    },

    // Some browsers reset the scroll position when the `display` CSS property
    // has changed without firing a scroll event.
    didInsertElement: function() {
        this._updateScrollPosition();
    },

    // Normally the scroll position is updated in `didInsertElement`, however
    // the element might be inserted with `display: none` in which case the
    // height of the visible area is not known.
    // Therefore we need to again update the scroll position once the view
    // becomes visible.
    becameVisible: function() {
        this._updateScrollPosition();
    },

    _updateScrollPosition: function() {
        var scrollView = this.nearestOfType(Flame.ScrollView);
        if (scrollView && scrollView.get('element')) {
            var element = scrollView.get('element');
            this._lastScrollHeight = element.offsetHeight;
            this._lastScrollTop = element.scrollTop;
            this.didScroll(this._lastScrollHeight, this._lastScrollTop);
        }
    },

    willDestroyElement: function() {
        this.forEach(function(view) {
            if (typeof view.get('contentIndex') !== 'undefined') {
                this._recycleView(view);
            }
        }, this);
    },

    numberOfRowsChanged: function() {
        Ember.run.scheduleOnce('afterRender', this, this._updateHeight);
    },

    _updateHeight: function() {
        var height = this.numberOfRows() * this.get('itemHeight');
        if (this.get('useAbsolutePosition')) {
            this.adjustLayout('height', height);
        } else {
            // In case the LazyListView has `useAbsolutePosition` set to false, `adjustLayout` will not work
            // and we need to set the height manually.
            if (this.$()) this.$().css('height', height + 'px');
            this.get('layout').height = height;
        }
    },

    numberOfRows: function() {
        return this.get('content.length');
    },

    didScroll: function(scrollHeight, scrollTop) {
        this._lastScrollHeight = scrollHeight;
        this._lastScrollTop = scrollTop;

        var range = this._rowsToRenderRange(scrollHeight, scrollTop);
        var min = range.end, max = range.start;
        var i, childViews = this._childViews, len = childViews.length;
        for (i = 0; i < len; i++) {
            var view = childViews[i];
            var contentIndex = view.get('contentIndex');
            if (typeof contentIndex !== 'undefined') {
                if (contentIndex < range.start || contentIndex > range.end) {
                    // This view is no longer visible, recycle it if it's not being dragged
                    if (!view.get('isDragged')) this._recycleView(view);
                } else {
                    min = Math.min(min, contentIndex);
                    max = Math.max(max, contentIndex);
                }
            }
        }

        // Fill up empty gap on top
        if (min === range.end) min++;
        for (i = range.start; i < min; i++) {
            this.viewForRow(i);
        }
        // Fill up empty gap on bottom
        if (max !== range.start) {
            for (i = range.end; i > max; i--) {
                this.viewForRow(i);
            }
        }

        this._hideRecycledViews();
    },

    /**
      Given the `scrollHeight` and `scrollTop`, calculate the range of rows
      in the visible area that need to be rendered.

      @param scrollHeight {Number}
      @param scrollTop {Number}
      @returns {Object} The range object, with `start` and `end` properties.
    */
    _rowsToRenderRange: function(scrollHeight, scrollTop) {
        if (!this.get('element')) return { start: 0, end: -1 };

        var length = this.numberOfRows();
        var itemHeight = this.get('itemHeight');
        // Need to know how much the list view is offset from the parent scroll view
        var offsetFromParent = this.get('parentView.element').scrollTop + this.$().position().top;
        var normalizedScrollTop = Math.max(0, scrollTop - offsetFromParent);
        var topRow = ~~(normalizedScrollTop / itemHeight);
        var bufferSize = this.get('bufferSize');
        var desiredRows = ~~(scrollHeight / itemHeight) + bufferSize;

        // Determine start and end index of rows to render
        var start = topRow - bufferSize / 2;
        var end = Math.min(length - 1, start + desiredRows);
        start = Math.max(0, end - desiredRows);

        return { start: start, end: end };
    },

    viewClassForItem: function(item) {
        return this.get('itemViewClass');
    },

    itemForRow: function(row) {
        return this.get('content')[row];
    },

    rowForItem: function(item) {
        var index = this.get('content').indexOf(item);
        return index === -1 ? null : index;
    },

    /**
      Get a view for the item on row number `row`.
      If possible, recycle an already existing view that is not visible anymore.
      When there are no views to recycle, create a new one.

      @param row {Number} The row number for which we want a view.
      @param attributes {Object} Attributes that should be used when a new view is created.
      @returns {Flame.ItemView} A fully instantiated view that renders the given row.
    */
    viewForRow: function(row, attributes) {
        var itemHeight = this.itemHeightForRow(row);
        var item = this.itemForRow(row);
        var viewClass = this.viewClassForItem(item);
        var itemClass = item.constructor.toString();
        var view = this._recycledViews[itemClass] && this._recycledViews[itemClass].pop();
        if (!view) {
            view = this.createChildView(viewClass, jQuery.extend({ useAbsolutePosition: true }, attributes || {}));
            this.pushObject(view);
        }

        view.beginPropertyChanges();
        view.set('isSelected', item === this.get('selection'));
        view.set('content', item);
        view.set('contentIndex', row);
        view.layout.top = row * itemHeight;
        view.propertyDidChange('layout');
        view.set('isVisible', true);
        view.endPropertyChanges();

        return view;
    },

    _hideRecycledViews: function() {
        Ember.changeProperties(function() {
            var views = this._recycledViews;
            for (var key in views) {
                var viewArray = views[key];
                var length = viewArray.length;
                for (var i = 0; i < length; i++) {
                    var view = viewArray[i];
                    if (view.get('isVisible')) view.set('isVisible', false);
                }
            }
        }, this);
    },

    /** Prepare a view to be recycled at a later point */
    _recycleView: function(view) {
        view.setProperties({ contentIndex: undefined, isSelected: false });
        var itemClass = view.get('content').constructor.toString();
        if (!this._recycledViews[itemClass]) this._recycledViews[itemClass] = [];
        this._recycledViews[itemClass].push(view);
    },

    /** Select the view at index `index` */
    selectIndex: function(index) {
        if (!this.get('allowSelection')) return false;
        var item = this.itemForRow(index);
        this.set('selection', item);
        return true;
    },

    changeSelection: function(direction) {
        var selection = this.get('selection');
        var row = this.rowForItem(selection);
        var newIndex = row + direction;
        // With this loop we jump over items that cannot be selected
        while (newIndex >= 0 && newIndex < this.numberOfRows()) {
            if (this.selectIndex(newIndex)) return true;
            newIndex += direction;
        }
        return false;
    },

    _setIsSelectedStatus: function(contentItem, status) {
        if (contentItem) {
            var row = this.rowForItem(contentItem);
            var view = this.childViewForIndex(row);
            // Might be that this view is not being rendered currently
            if (view) view.set('isSelected', status);
        }
    },

    itemHeightForRow: function(index) {
        return this.get('itemHeight');
    },

    indexForMovedItem: function(draggingInfo, proposedIndex, originalIndex) {
        return { currentIndex: proposedIndex, toParent: this.get('content'), toPosition: proposedIndex };
    },

    moveItem: function(from, draggingInfo) {
        throw new Error('Not implemented yet!');
    },

    childViewForIndex: function(index) {
        return this.findBy('contentIndex', index);
    },

    // override this to temporarily disable re-ordering
    disableReordering: function(event) {
        return false;
    }
});

})();
(function() {
'use strict';


Flame.LazyTreeItemView = Flame.LazyListItemView.extend({
    classNames: ['flame-tree-item-view'],
    itemContent: '{{view.content}}',
    isExpanded: false,

    collapsedImage: Flame.image('disclosure_triangle_right.svg'),
    expandedImage: Flame.image('disclosure_triangle_down.svg'),

    handlebars: function() {
        return '{{{view.disclosureImage}}} <span>' + this.get('itemContent') + '</span>';
    }.property('itemContent'),

    isExpandedDidChange: function() {
        Ember.run.schedule('afterRender', this, function() {
            this.$().find('img').first().replaceWith(this.get('disclosureImage'));
        });
    }.observes('isExpanded'),

    isExpandable: function() {
        return this.get('parentView').isExpandable(this.get('content'));
    },

    ensureCorrectLevelClass: function(level) {
        if (this._indentationLevel === level) return;

        var classNames = this.get('classNames');
        var levelClass = 'level-' + (level + 1);

        if (this._indentationLevel) {
            // Remove old level class
            var oldLevelClass = 'level-' + (this._indentationLevel + 1);
            classNames.removeObject(oldLevelClass);

            // Updating the classNames array alone is not enough. If the view has already
            // been inserted in the DOM, we also need to update the element.
            if (this.get('_state') === 'inDOM') {
                this.$().removeClass(oldLevelClass);
            }
        }

        // Add new level class
        classNames.pushObject(levelClass);
        if (this.get('_state') === 'inDOM') {
            this.$().addClass(levelClass);
        }

        this._indentationLevel = level;
    },

    disclosureImage: function() {
        var isExpandable = this.isExpandable();
        if (!isExpandable) return '';
        return '<img src="%@">'.fmt(this.get('isExpanded') ? this.get('expandedImage') : this.get('collapsedImage'));
    }.property('isExpanded', 'content', 'expandedImage', 'collapsedImage'),

    mouseIsDown: Flame.LazyListViewStates.MouseIsDown.extend({
        mouseUp: function(event) {
            var owner = this.get('owner');
            if (owner.isExpandable()) {
                var parentView = owner.get('parentView');
                owner.toggleProperty('isExpanded');
                parentView.toggleItem(owner);
            }
            return this._super(event);
        }
    }),

    /**
      If this item is expanded, we want to collapse it before we start
      dragging to simplify the reordering.
    */
    willStartDragging: function() {
        if (this.get('isExpanded')) {
            this.toggleProperty('isExpanded');
            this.get('parentView').toggleItem(this);
        }
    }
});

})();
(function() {
'use strict';




/**
  The tree in the `LazyTreeView` is being rendered as a flat list, with items
  being indented to give the impression of a tree structure.
  We keep a number of internal caches to easily map this flat list onto the
  tree we're rendering.

  @class LazyTreeView
  @extends LazyListView
*/

Flame.LazyTreeView = Flame.LazyListView.extend({
    classNames: ['flame-tree-view', 'flame-lazy-tree-view'],
    itemViewClass: Flame.LazyTreeItemView,
    _rowToItemCache: null,
    _itemToRowCache: null,
    _itemToLevelCache: null,
    _itemToParentCache: null,
    _expandedItems: null,
    _numberOfCachedRows: null,

    init: function() {
        this._invalidateRowCache();
        this._expandedItems = Ember.Set.create();
        // Call the super-constructor last as Flame.ListView constructor calls #_selectionDidChange() which causes
        // calls to #_setIsSelectedStatus() that calls #rowForItem() which expects the caches to be set up.
        this._super();
    },

    numberOfRowsChanged: function() {
        this._invalidateRowCache();
        this.loadCache();
        this._super();
    },

    numberOfRows: function() {
        return this._numberOfCachedRows;
    },

    loadItemIntoCache: function(item, level, parent) {
        this._rowToItemCache[this._numberOfCachedRows] = item;
        this._itemToRowCache.set(item, this._numberOfCachedRows);
        this._itemToLevelCache.set(item, level);
        if (parent) this._itemToParentCache.set(item, parent);

        this._numberOfCachedRows++;

        // If an item is not expanded, we don't care about its children
        if (!this._expandedItems.contains(item)) return;
        // Handle children
        var children = item.get('treeItemChildren');
        if (children) {
            var length = children.get('length');
            for (var i = 0; i < length; i++) {
                this.loadItemIntoCache(children.objectAt(i), level + 1, item);
            }
        }
    },

    loadCache: function() {
        var content = this.get('content');
        var length = content.get('length');
        for (var i = 0; i < length; i++) {
            this.loadItemIntoCache(content.objectAt(i), 0);
        }
    },

    viewClassForItem: function(item) {
        return this.get('itemViewClasses')[item.constructor.toString()];
    },

    itemForRow: function(row) {
        return this._rowToItemCache[row];
    },

    rowForItem: function(item) {
        return this._itemToRowCache.get(item);
    },

    levelForItem: function(item) {
        if (!item) return -1;
        return this._itemToLevelCache.get(item);
    },

    /** The tree view needs to additionally set the correct indentation level */
    viewForRow: function(row) {
        var item = this.itemForRow(row);
        var isExpanded = this._expandedItems.contains(item);
        var view = this._super(row, { isExpanded: isExpanded });
        view.set('isExpanded', isExpanded);
        view.ensureCorrectLevelClass(this.levelForItem(item));
        return view;
    },

    _invalidateRowCache: function() {
        this._rowToItemCache = [];
        this._itemToRowCache = Ember.Map.create();
        this._itemToLevelCache = Ember.Map.create();
        this._itemToParentCache = Ember.Map.create();
        this._numberOfCachedRows = 0;
    },

    isExpandable: function(item) {
        return true;
    },

    collapseItem: function(item) {
        this.changeIsExpanded(item, false);
    },

    expandItem: function(item) {
        this.changeIsExpanded(item, true);
    },

    changeIsExpanded: function(item, status) {
        if (status) {
            this._expandedItems.add(item);
        } else {
            this._expandedItems.remove(item);
        }

        var row = this.rowForItem(item);
        var view = this.childViewForIndex(row);
        if (view && !view.get('isExpanded')) {
            view.set('isExpanded', status);
            if (status) {
                this.toggleItem(view);
            }
        }
    },

    /**
      This is where we expand or collapse an item in the `LazyTreeView`.
      The expanding or collapsing is done in these steps:

      1. Record the expanded/collapsed status of the item.
      2. Update the position of views that have shifted due to an item being
         expanded or collapsed.
      3. Remove views that were used to render a subtree that is now collapsed.
      4. Render missing views; When collapsing an item, we might need to render
         extra views to fill up the gap created at the bottom of the visible area.
         This also renders the subtree of the item we just expanded.

      @param view {Flame.LazyListItemView} The view that was clicked to expand or collapse the item
    */
    toggleItem: function(toggledView) {
        var item = toggledView.get('content');
        var isExpanded = toggledView.get('isExpanded');
        if (isExpanded) {
            this._expandedItems.add(item);
        } else {
            this._expandedItems.remove(item);
        }
        this.numberOfRowsChanged();

        // Update rendering
        var indices = [];
        var range = this._rowsToRenderRange(this._lastScrollHeight, this._lastScrollTop);
        this.forEach(function(view) {
            var contentIndex = view.get('contentIndex');
            var content = view.get('content');
            var row = this.rowForItem(content);
            if (typeof row === 'undefined' && typeof contentIndex !== 'undefined') {
                this._recycleView(view);
            } else if (typeof contentIndex !== 'undefined') {
                indices.push(row);
                if (contentIndex !== row) {
                    view.set('contentIndex', row);
                    var itemHeight = this.itemHeightForRow(row);
                    view.$().css('top', row * itemHeight + 'px');
                }
                if (row < range.start || row > range.end) {
                    this._recycleView(view);
                }
            }
        }, this);

        // Render missing views
        for (var i = range.start; i <= range.end; i++) {
            if (indices.indexOf(i) === -1) {
                this.viewForRow(i);
            }
        }
        this._hideRecycledViews();
    },

    moveRight: function() {
        return this._collapseOrExpandSelection('expand');
    },

    moveLeft: function() {
        return this._collapseOrExpandSelection('collapse');
    },

    _collapseOrExpandSelection: function(action) {
        var selection = this.get('selection');
        if (selection) {
            var row = this.rowForItem(selection);
            var view = this.childViewForIndex(row);
            if (view) {
                if (action === 'collapse' && view.get('isExpanded')) {
                    view.set('isExpanded', false);
                    this.toggleItem(view);
                    return true;
                } else if (action === 'expand' && !view.get('isExpanded')) {
                    view.set('isExpanded', true);
                    this.toggleItem(view);
                    return true;
                }
            } else {
                // The view is currently not visible, just record the status
                if (this._expandedItems.contains(selection)) {
                    this._expandedItems.remove(selection);
                } else {
                    this._expandedItems.add(selection);
                }
                return true;
            }
        }
        return false;
    },

    isValidDrop: function(item, parent) {
        return true;
    },

    getAncestors: function(item) {
        var ancestors = [item];
        var parent = this._itemToParentCache.get(item);
        while (parent) {
            ancestors.push(parent);
            parent = this._itemToParentCache.get(parent);
        }
        ancestors.push(null);
        return ancestors;
    },

    /**
      @param {Object} draggingInfo
      @param {Number} proposedIndex
      @param {Number} originalIndex

      @return draggingInfo
    */
    indexForMovedItem: function(draggingInfo, proposedIndex, originalIndex, newLeft) {
        // Bounds checking
        if (proposedIndex < 0) proposedIndex = 0;
        if (proposedIndex > this.numberOfRows()) proposedIndex = this.numberOfRows();

        // Get items of interest
        var movedItem = this.itemForRow(originalIndex);
        var itemAbove = this.itemForRow(proposedIndex - 1);
        var itemBelow = this.itemForRow(proposedIndex);

        // Get the closest parent for the given position
        var closestParent = null;
        if (this._expandedItems.contains(itemAbove)) {
            closestParent = itemAbove;
        } else {
            for (var i = proposedIndex - 1; i >= 0; i--) {
                var item = this.itemForRow(i);
                if (this.levelForItem(item) >= this.levelForItem(itemAbove)) continue;
                if (this._expandedItems.contains(item)) {
                    closestParent = item;
                    break;
                }
            }
        }

        var possibleParents = this.getAncestors(closestParent).filter(function(parent) {
            return this.levelForItem(parent) + 1 - this.levelForItem(itemBelow) >= 0 && this.isValidDrop(movedItem, parent);
        }, this);

        if (possibleParents.length === 0) return draggingInfo;

        var itemLevel = this.levelForItem(movedItem);
        var changeLevel = ~~(newLeft / 22); // 22 pixels per level of indentation
        var intendedLevel = itemLevel + changeLevel;

        var intendedParent = null;
        possibleParents.forEach(function(parent) {
            if (!intendedParent || Math.abs(this.levelForItem(parent) - intendedLevel) < Math.abs(this.levelForItem(intendedParent) - intendedLevel)) {
                intendedParent = parent;
            }
        }, this);

        var position = null;
        if (!intendedParent) {
            position = itemBelow ? this.get('content').indexOf(itemBelow) : this.get('content.length');
        } else if (itemBelow && this.levelForItem(itemBelow) === this.levelForItem(intendedParent) + 1) {
            // The item below belongs to the same parent as the item we're dragging
            position = intendedParent.get('treeItemChildren').indexOf(itemBelow);
        } else {
            // The item is the last item in the parent
            position = intendedParent.get('treeItemChildren.length');
        }

        var parentLevel = this.levelForItem(intendedParent);
        return { currentIndex: proposedIndex, toParent: intendedParent, toPosition: position, level: parentLevel + 1 };
    },

    moveItem: function(from, draggingInfo) {
        var movedView = this.childViewForIndex(from);
        var to = draggingInfo.currentIndex;
        var direction = from < to ? -1 : 1;
        var itemHeight = this.get('itemHeight');
        this.forEachChildView(function(view) {
            var contentIndex = view.get('contentIndex');
            if (contentIndex > from && contentIndex < to ||
                contentIndex < from && contentIndex >= to) {
                view.set('contentIndex', contentIndex + direction);
                view.$().css('top', view.get('contentIndex') * itemHeight);
            }
        });
        if (direction < 0) to--;
        movedView.set('contentIndex', to);
        movedView.ensureCorrectLevelClass(draggingInfo.level);
        movedView.$().css('top', to * itemHeight);

        if (direction < 0) to++;
        var fromItem = this.itemForRow(from);
        var fromParent = this._itemToParentCache.get(fromItem);
        var toParent = draggingInfo.toParent;

        var fromContent = fromParent ? fromParent.get('treeItemChildren') : this.get('content');
        var toContent = toParent ? toParent.get('treeItemChildren') : this.get('content');
        if (fromContent === toContent && from < to) draggingInfo.toPosition--;

        this._suppressObservers = true;
        fromContent.removeObject(fromItem);
        toContent.insertAt(draggingInfo.toPosition, fromItem);
        this.numberOfRowsChanged();
        // Keep suppressing observers until the next runloop
        Ember.run.next(this, function() {
            this._suppressObservers = false;
        });

        var delegate = this.get('reorderDelegate');
        if (delegate && delegate.didReorderContent) {
            Ember.run.next(this, function() {
                delegate.didReorderContent(fromItem, toContent);
            });
        }
    }
});

})();
(function() {
'use strict';

Flame.LoadingIndicatorView = Flame.ImageView.extend({
    layout: { width: 16, height: 16 },
    classNames: ['loading-indicator'],
    value: Flame.image('loading.gif')
});

})();
(function() {
'use strict';

/**
  Flame.Popover provides a means to display a popup in the context of an existing element in the UI.
*/

Flame.Popover = Flame.Panel.extend({
    classNames: ['flame-popover'],
    childViews: [],
    dimBackground: false,
    handlebars: '<img {{bind-attr class="view.arrowPosition :arrow"}} {{bind-attr src="view.image"}}>{{view view.contentView}}',
    anchor: null,
    position: null,

    ARROW_UP: Flame.image('arrow_up.png'),
    ARROW_DOWN: Flame.image('arrow_down.png'),
    ARROW_LEFT: Flame.image('arrow_left.png'),
    ARROW_RIGHT: Flame.image('arrow_right.png'),

    _positionArrow: function() {
        var anchor = this.get('anchor');
        var position = this.get('position');
        var arrow = this.$('img.arrow');
        var offset = anchor.offset();
        var arrowOffset;

        var dimensions = this._getDimensionsForAnchorElement(anchor);

        if (position & (Flame.POSITION_ABOVE | Flame.POSITION_BELOW)) {
            arrowOffset = offset.left + (dimensions.width / 2) - (!this.$().css('left') ? 0 : parseInt(this.$().css('left').replace('px', ''), 10)) - 15;
            arrow.css({ left: arrowOffset + 'px' });
            if (position & Flame.POSITION_ABOVE) {
                arrow.css({ top: this.get('layout.height') - 1 + 'px' });
            }
        } else {
            arrowOffset = offset.top + (dimensions.height / 2) - parseInt(this.$().css('top').replace('px', ''), 10) - 15;
            arrow.css({ top: arrowOffset + 'px' });
            if (position & Flame.POSITION_LEFT) {
                arrow.css({ left: this.get('layout.width') - 1 + 'px' });
            }
        }
    }.on('didInsertElement'),

    _layoutRelativeTo: function(anchor, position) {
        anchor = anchor instanceof jQuery ? anchor : anchor.$();
        this.set('anchor', anchor);
        this.set('position', position);

        var layout = this._super(anchor, position);
        if (layout.movedX || layout.movedY) {
            // If the popover did not fit the viewport on one side, try to position it on the other side
            if (layout.movedX && position & (Flame.POSITION_LEFT | Flame.POSITION_RIGHT)) position ^= Flame.POSITION_LEFT | Flame.POSITION_RIGHT;
            if (layout.movedY && position & (Flame.POSITION_ABOVE | Flame.POSITION_BELOW)) position ^= Flame.POSITION_ABOVE | Flame.POSITION_BELOW;
            layout = this._super(anchor, position);
            this.set('position', position);
        }

        if (position & Flame.POSITION_ABOVE) {
            layout.top -= 15;
            this.set('arrowPosition', 'above');
            this.set('image', this.ARROW_DOWN);
        } else if (position & Flame.POSITION_BELOW) {
            layout.top += 15;
            this.set('arrowPosition', 'below');
            this.set('image', this.ARROW_UP);
        } else if (position & Flame.POSITION_LEFT) {
            layout.left -= 15;
            this.set('arrowPosition', 'left');
            this.set('image', this.ARROW_RIGHT);
        } else if (position & Flame.POSITION_RIGHT) {
            layout.left += 15;
            this.set('arrowPosition', 'right');
            this.set('image', this.ARROW_LEFT);
        }
        return layout;
    },

    popup: function(anchor, position) {


        this._super(anchor, position | Flame.POSITION_MIDDLE);
    }
});

})();
(function() {
'use strict';

Flame.ProgressView = Flame.View.extend({
    classNames: ['flame-progress-view'],

    value: null,
    maximum: null,
    animate: false,

    handlebars: function() {
        var height = this.get('layout').height;
        return "<div style='height: %@px;' class='progress-container'></div><div style='height: %@px; width: %@px;' class='progress-bar'></div>".fmt(height - 2, height - 4, this.get('size'));
    }.property(),

    size: function() {
        var progress = this.get('value') / this.get('maximum');
        if (isNaN(progress)) {
            return 0;
        } else {
            var width = this.get('layout').width;
            if (progress > 1) progress = 1;
            return Math.floor(width * progress) - 4;
        }
    }.property('value', 'maximum'),

    sizeDidChange: function() {
        Ember.run.schedule('afterRender', this, function() {
            if (this.get('_state') === 'inDOM') {
                if (this.get('animate')) {
                    this.$('.progress-bar').animate({width: this.get('size')}, 300);
                } else {
                    this.$('.progress-bar').css('width', this.get('size'));
                }
            }
        });
    }.observes('size')
});

})();
(function() {
'use strict';

Flame.RadioButtonView = Flame.CheckboxView.extend({
    classNames: ['flame-radio-button-view'],

    action: function() {
        this.set('targetValue', this.get('value'));
    },

    isSelected: function(key, value) {
        if (Ember.typeOf(this.get('value')) === 'undefined' || Ember.typeOf(this.get('targetValue')) === 'undefined') {
            return false;
        }
        return this.get('value') === this.get('targetValue');
    }.property('targetValue', 'value'),

    renderCheckMark: function(buffer) {
        buffer.push('<div class="flame-view flame-checkbox-checkmark" style="top:8px;left:8px;width:6px;height:6px;"></div>');
    }
});

})();
(function() {
'use strict';

/**
  Flame.ScrollView provides a scrollable container. In the DOM this is just a div
  with `overflow: auto`.

  When the ScrollView is scrolled, it will notify each child view that implements
 `didScroll`, passing in the height of the ScrollView and the total amount scrolled.

  TODO * when a child view falls completely outside of the visible area, display should
         be set to `none` so that the browser does not need to render views that are not
         visible.
       * the ScrollView should fire an update when the ScrollView is resized (either
         due to the window being resized, or due to a HorizontalSplitView).
*/

Flame.ScrollView = Flame.View.extend({
    classNames: ['scroll-view'],
    /** Last known vertical scroll offset */
    lastScrollY: 0,
    /** Is the ScrollView currently being scrolled? */
    isScrolling: false,

    didInsertElement: function() {
        this.$().on('scroll', jQuery.proxy(this.didScroll, this));
        this._update();
    },

    willDestroyElement: function() {
        this.$().off('scroll');
    },

    didScroll: function(event) {
        this.lastScrollY = this.get('element').scrollTop;
        if (!this.isScrolling) {
            requestAnimationFrame(jQuery.proxy(this._update, this));
        }
        this.isScrolling = true;
    },

    _update: function() {
        var height = this.get('element').offsetHeight;
        var scrollTop = this.lastScrollY;
        this.isScrolling = false;
        // Notify childViews the scrollview has scrolled
        var i, childViews = this._childViews, len = childViews.length;
        for (i = 0; i < len; i++) {
            var view = childViews[i];
            if (view.didScroll) view.didScroll(height, scrollTop);
        }
    }
});

})();
(function() {
'use strict';


Flame.SearchTextFieldView = Flame.TextFieldView.extend({
    classNames: ['flame-search-field'],
    childViews: ['textField', 'clearButton'],

    clearButton: Flame.ButtonView.extend({
        resetClassNames: true,
        layout: { right: 5, top: 2 },
        isVisible: Ember.computed.bool('parentView.value'),
        handlebars: '<img src="/assets/images/search_clear.svg">',

        action: function() {
            this.get('parentView').cancel();
        }
    }),

    cancel: function() {
        if (Ember.isEmpty(this.get('value'))) {
            // Nothing to clear, we don't handle the event
            return false;
        } else {
            this.set('value', '');
            return true;
        }
    }
});

})();
(function() {
'use strict';


Flame.StackItemView = Flame.ListItemView.extend({
    useAbsolutePosition: true,
    classNames: ['flame-stack-item-view']
});

})();
(function() {
'use strict';

// Stack view is a list view that grows with the content and uses absolute positioning for the child views.
// Use class StackItemView as the superclass for the item views.
Flame.StackView = Flame.ListView.extend({
    layoutManager: Flame.VerticalStackLayoutManager.create({ topMargin: 0, spacing: 0, bottomMargin: 0 }),
    allowSelection: false
});

})();
(function() {
'use strict';

Flame.TabView = Flame.View.extend({
    classNames: ['flame-tab-view'],
    childViews: ['tabBarView', 'contentView'],
    tabs: null,
    previousTabs: null,
    nowShowing: null,
    tabsHeight: 23,
    initializeTabsLazily: true,

    init: function() {
        this._super();
        // if tabs not set via binding, we need to build the tabs here
        if (!Ember.isNone(this.get('tabs'))) {
            this._tabsDidChange();
        }
    },

    _tabsWillChange: function() {
        var tabs = this.get('tabs');
        if (!Ember.isNone(tabs)) {
            this.set('previousTabs', tabs.slice());
        }
    }.observesBefore('tabs.[]'),

    _tabsDidChange: function() {
        var tabs = this.get('tabs');
        if (Ember.isNone(tabs)) {
            return;
        }
        var previousTabs = this.get('previousTabs');

        if (!Ember.isNone(previousTabs)) {
            previousTabs.forEach(function(tab, i) {
                if (Ember.isNone(tabs.findBy('value', tab.value))) {
                    var tabBarView = this.get('tabBarView');
                    tabBarView.forEach(function(tabView) {
                        if (tabView.get('value') === tab.value) tabBarView.removeChild(tabView);
                    });
                }
            }, this);
        }

        tabs.forEach(function(tab, i) {
            if (Ember.isNone(previousTabs) || Ember.isNone(previousTabs.findBy('value', tab.value))) {
                this._addTab(tab, i);
            }
        }, this);
    }.observes('tabs.[]'),

    _addTab: function(tab, index) {
        var contentView = this.get('contentView');
        var tabBarView = this.get('tabBarView');
        var tabsHeight = this.get('tabsHeight');
        var self = this;

        var buttonConfig = {
            acceptsKeyResponder: false,
            layout: { top: 0, bottom: 0, height: tabsHeight },
            title: tab.title,
            value: tab.value,
            tabView: this,
            isSelected: Ember.computed.equal('parentView.parentView.nowShowing', tab.value),
            action: function() {
                self.set('nowShowing', tab.value);
            }
        };

        if (tab.tabClass) {
            buttonConfig.classNameBindings = ['tabView.%@.%@'.fmt(tab.value, tab.tabClass)];
        }

        tabBarView.insertAt(index, tabBarView.createChildView(Flame.ButtonView.createWithMixins(buttonConfig)));

        var view = this.get(tab.value);


        if (!this.get('initializeTabsLazily')) {
            if (!(view instanceof Ember.View)) {
                view = contentView.createChildView(view);
            }
            view.set('isVisible', false);
            contentView.pushObject(view);
            this.set(tab.value, view);
        }

        if (Ember.isNone(this.get('nowShowing'))) this.set('nowShowing', this.get('tabs').objectAt(0).value);
    },

    _tabWillChange: function() {
        if (this.get('nowShowing')) {
            this.get(this.get('nowShowing')).set('isVisible', false);
        }
    }.observesBefore('nowShowing'),

    _tabDidChange: function() {
        if (this.get('nowShowing')) {
            var nowShowing = this.get('nowShowing');
            var view = this.get(nowShowing);
            if (!(view instanceof Ember.View)) {
                var contentView = this.get('contentView');
                view = contentView.createChildView(view);
                contentView.pushObject(view);
                this.set(nowShowing, view);
            }
            view.set('isVisible', true);
        }
    }.observes('nowShowing').on('init'),

    tabBarView: Flame.View.extend({
        classNames: ['flame-tab-view-tabs'],
        layout: { left: 0, top: 0, right: 0, height: 'parentView.tabsHeight' }
    }),

    contentView: Flame.View.extend({
        classNames: ['flame-tab-view-content'],
        layout: { left: 0, top: 'parentView.tabsHeight', right: 0, bottom: 0 }
    })
});

})();
(function() {
'use strict';

var isWebKit = /webkit/i.test(window.navigator.userAgent);

Flame.TableDataView = Flame.View.extend(Flame.Statechart, {
    classNames: ['flame-table-data-view'],
    acceptsKeyResponder: true,
    batchUpdates: true,
    updateBatchSize: 500,
    _updateCounter: 0,
    selectedCell: null,
    selectionEnd: null,
    editValue: null,
    content: null,
    tableViewDelegate: null,

    initialFlameState: 'loaded',

    loaded: Flame.State.extend({
        mouseDown: function(event) {
            var owner = this.get('owner');
            if (owner.selectCell(owner._cellForTarget(event.target), false)) {
                owner.get('selection').show();
                this.gotoFlameState('mouseIsDown');
                return true;
            } else {
                return false;
            }
        },

        enterState: function() {
            var owner = this.get('owner');
            owner.set('selectedCell', null);
            owner.set('selectionEnd', null);
            if (owner.get('_state') === 'inDOM') {
                owner.get('selection').children().addBack().hide();
            }
        }
    }),

    mouseIsDown: Flame.State.extend({
        lastTarget: null,

        mouseMove: function(event) {
            if (event.target !== this.lastTarget) {
                var owner = this.get('owner');
                var cell = owner._cellForTarget(event.target);
                if (cell && owner.isCellSelectable(cell)) {
                    owner.set('selectionEnd', cell);
                }
                this.lastTarget = event.target;
            }
            return true;
        },

        mouseUp: function(event) {
            this.gotoFlameState('selected');
            return this.get('owner').invokeStateMethod('mouseUp', event);
        }
    }),

    selected: Flame.State.extend({
        cellUp: function(cell) {
            return jQuery(cell.parent().prev().children()[cell.attr('data-index')]);
        },

        cellDown: function(cell) {
            return jQuery(cell.parent().next().children()[cell.attr('data-index')]);
        },

        modifySelection: function(cell) {
            var owner = this.get('owner');
            if (owner.isCellSelectable(cell)) {
                owner.set('selectionEnd', cell);
                owner.notifySelectionChange();
                return true;
            }
            return false;
        },

        _trim: function(value) {
            // Trim value to allow correct pasting behavior to cells (normalize line changes, strip leading/trailing whitespace, but preserve tabs)
            value = value.replace(/\r\n|\r/g, '\n');
            value = value.replace(/^[^\S\t]+|[^\S\t]+$/g, '');
            return value;
        },

        pasteValue: function(value) {
            value = this._trim(value);
            var owner = this.get('owner');
            var data = owner.get('data');
            var selectedCell = this.get('owner.selectedCell');
            var rowIndex = owner.rowIndex(selectedCell);
            var columnIndex = owner.columnIndex(selectedCell);

            var pasteFailed = function(pastedValue) {
                var tableViewDelegate = owner.get('tableViewDelegate');
                if (tableViewDelegate && tableViewDelegate.pasteDidFail) tableViewDelegate.pasteDidFail(pastedValue);
            };

            // If only one value is in the clipboard and a range is selected,
            // copy that value to all selected cells.
            if (!/\n|\t/.test(value) && selectedCell !== this.get('owner.selectionEnd')) {
                this._forEachSelectedCell(function(i, j, dataCell) {
                    if (dataCell && dataCell.isEditable() && dataCell.isPastable()) {
                        var cell = owner.$('tr[data-index=%@]'.fmt(i)).find('td[data-index=%@]'.fmt(j)).first();
                        if (!owner._validateAndSet(value, cell)) pasteFailed(value);
                    }
                });
                return;
            }

            var rows = selectedCell.parent().add(selectedCell.parent().nextAll());
            value.split('\n').forEach(function(line, i) {
                line.split('\t').forEach(function(field, j) {
                    var cell = rows[i] && rows.eq(i).children().eq(columnIndex + j);
                    if (!cell) return;
                    var dataCell = data[rowIndex + i][columnIndex + j];
                    if (dataCell && dataCell.isEditable() && dataCell.isPastable()) {
                        if (dataCell.options()) {
                            var option = dataCell.options().findBy('title', field);
                            if (!option) {
                                pasteFailed(field);
                                return;
                            }
                            field = option.value;
                        }
                        if (!owner._validateAndSet(field, cell)) pasteFailed(field);
                    }
                });
            });
        },

        /**
          For the current selection, get a value that can be pasted to another
          TableView or spreadsheet.
        */
        valueForCopy: function() {
            var value = [];
            var row;
            this._forEachSelectedCell(function(i, j, cell, newLine) {
                if (newLine) {
                    if (!Ember.isEmpty(row)) value.push(row.join('\t'));
                    row = [];
                }
                row.push(cell && cell.isCopyable() ? cell.editableValue() : '');
            });
            if (!Ember.isEmpty(row)) value.push(row.join('\t'));
            return value.join('\n');
        },

        _forEachSelectedCell: function(callback) {
            var owner = this.get('owner');
            var selectedCell = owner.get('selectedCell');
            var selectionEnd = owner.get('selectionEnd');
            var minRow = Math.min(owner.rowIndex(selectedCell), owner.rowIndex(selectionEnd));
            var maxRow = Math.max(owner.rowIndex(selectedCell), owner.rowIndex(selectionEnd));
            var minCol = Math.min(owner.columnIndex(selectedCell), owner.columnIndex(selectionEnd));
            var maxCol = Math.max(owner.columnIndex(selectedCell), owner.columnIndex(selectionEnd));

            var data = owner.get('data');
            for (var i = minRow; i <= maxRow; i++) {
                var newLine = true;
                for (var j = minCol; j <= maxCol; j++) {
                    callback(i, j, data[i][j], newLine);
                    newLine = false;
                }
            }
        },

        _getCellUnderSelection: function(event) {
            var owner = this.get('owner');
            owner.get('selection').hide();
            var cell = document.elementFromPoint(event.clientX, event.clientY);
            owner.get('selection').show();
            return cell;
        },

        mouseDown: function(event) {
            var owner = this.get('owner');
            // For browsers that don't support pointer-events, clicking the selection div
            // will absorb the mouseDown event.
            if (jQuery(event.target).hasClass('table-selection')) {
                event.target = this._getCellUnderSelection(event);
            }

            // If a cell is clicked that was already selected and it's a cell
            // with fixed options, start editing it.
            var $target = jQuery(event.target);
            var selectedDataCell = owner.get('selectedDataCell');
            if (!Ember.isNone(selectedDataCell) &&
                    selectedDataCell.options && selectedDataCell.options() &&
                    $target.is('td') &&
                    owner._cellForTarget(event.target)[0] === owner.get('selectedCell')[0]) {
                this.startEdit();
                return true;
            }

            var target = owner._cellForTarget(event.target);
            if (event.shiftKey && owner.isCellSelectable(target)) {
                owner.set('selectionEnd', target);
                return true;
            } else if ($target.closest('.table-selection').length) {
                // If an element inside of the selection div was clicked, we
                // let the delegate handle the click in mouseUp.
                return true;
            } else {
                this.gotoFlameState('loaded');
                return owner.invokeStateMethod('mouseDown', event);
            }
        },

        mouseUp: function(event) {
            var tableViewDelegate = this.get('owner.tableViewDelegate');
            if (tableViewDelegate && tableViewDelegate.mouseUp) {
                var $target = jQuery(event.target);
                // Fallback for browsers that don't support pointer-events
                if ($target.hasClass('table-selection')) {
                    event.target = this._getCellUnderSelection(event);
                    $target = jQuery(event.target);
                }

                // Did we click on the cell or on an element inside the table selection?
                var cell = $target.is('td') ? $target : jQuery(this._getCellUnderSelection(event));
                var columnIndex = cell.attr('data-index');
                var rowIndex = cell.parent().attr('data-index');

                if (columnIndex && rowIndex) {
                    var dataCell = this.get('owner.data')[rowIndex][columnIndex];
                    var index = [rowIndex, columnIndex];
                    tableViewDelegate.mouseUp(event, cell, dataCell, index, this.get('owner'));
                }
            }
        },

        keyDown: function(event, view) {
            var owner = this.get('owner');
            var selectedDataCell = owner.get('selectedDataCell');
            if ((event.ctrlKey || event.metaKey) && !Ember.isNone(selectedDataCell)) {
                var position = owner.get('selectedCell').position();
                var scrollable = owner.get('parentView.scrollable');
                var $container = owner.$('.clipboard-container');
                $container.css({ left: position.left + scrollable.scrollLeft(), top: position.top + scrollable.scrollTop() });
                $container.empty().show();
                var $textarea = jQuery('<textarea></textarea>')
                    .val(this.valueForCopy())
                    .appendTo($container)
                    .focus()
                    .select();

                var self = this;
                $textarea.on('paste', function(e) {
                    var clipboardData = e.originalEvent.clipboardData || window.clipboardData;
                    var pastedValue = clipboardData.getData('Text');
                    // IE11 doesn't allow AJAX requests from the paste event,
                    // this is how we work around it.
                    Ember.run.later(self, function() {
                        this.pasteValue(pastedValue);
                    }, 100);
                });

                // Make sure that control/command + <other key> combinations will still be handled by the browser
                return false;
            }

            return !owner._handleKeyEvent('keyDown', event, view);
        },

        keyUp: function(event) {
            var $target = jQuery(event.target);
            if ($target.hasClass('clipboard-container textarea')) {
                $target.off('paste');
                var $container = this.$('.clipboard-container');
                $container.empty().hide();
                return true;
            }
            return false;
        },

        // We need to use the keyPress event, as some browsers don't report the character pressed correctly with keyDown
        keyPress: function(event) {
            if (event.ctrlKey || event.metaKey) return false;
            var dataCell = this.get('owner.selectedDataCell');
            if (Ember.isNone(dataCell) || !dataCell.isEditable()) {
                return false;
            }
            var key = String.fromCharCode(event.which);
            if (/[a-zA-Z0-9+*\-\[\/\=]/.test(key)) {
                var owner = this.get('owner');
                owner.set('editValue', key);
                this.startEdit();
                return true;
            }
            return false;
        },

        insertNewline: function(event) {
            return this.startEdit();
        },

        deleteBackward: function(event) {
            this.wipeCell();
            return true;
        },

        deleteForward: function(event) {
            this.wipeCell();
            return true;
        },

        wipeCell: function() {
            var dataCell = this.get('owner.selectedDataCell');
            if (Ember.isNone(dataCell)) {
                return;
            }

            if (dataCell.isEditable()) {
                this.get('owner')._validateAndSet('');
            }
        },

        doubleClick: function() {
            this.startEdit();
        },

        startEdit: function(event) {
            var dataCell = this.get('owner.selectedDataCell');
            if (Ember.isNone(dataCell)) {
                return;
            }
            var owner = this.get('owner');
            if (dataCell.isEditable()) {
                owner.set('selectionEnd', owner.get('selectedCell'));
                this.gotoFlameState('editing');
            } else if (!dataCell.options()) {
                owner.set('selectionEnd', owner.get('selectedCell'));
                this.gotoFlameState('selectingReadOnly');
            }
        },

        cancel: function(event) {
            this.get('owner').resignKeyResponder();
            return true;
        },

        moveLeft: function(event) {
            this.get('owner').selectCell(this.get('owner.selectedCell').prev());
            return true;
        },

        moveLeftAndModifySelection: function(event) {
            return this.modifySelection(this.get('owner.selectionEnd').prev());
        },

        moveRight: function(event) {
            this.get('owner').selectCell(this.get('owner.selectedCell').next());
            return true;
        },

        moveRightAndModifySelection: function(event) {
            return this.modifySelection(this.get('owner.selectionEnd').next());
        },

        moveDown: function(event) {
            this.get('owner').selectCell(this.cellDown(this.get('owner.selectedCell')));
            return true;
        },

        moveDownAndModifySelection: function(event) {
            return this.modifySelection(this.cellDown(this.get('owner.selectionEnd')));
        },

        moveUp: function(event) {
            this.get('owner').selectCell(this.cellUp(this.get('owner.selectedCell')));
            return true;
        },

        moveUpAndModifySelection: function(event) {
            return this.modifySelection(this.cellUp(this.get('owner.selectionEnd')));
        },

        insertTab: function(event) {
            this.get('owner').invokeStateMethod('moveRight');
            return true;
        },

        insertBacktab: function(event) {
            this.get('owner').invokeStateMethod('moveLeft');
            return true;
        },

        enterState: function() {
            this.get('owner').notifySelectionChange();
        },

        exitState: function() {
            if (this.get('owner._state') !== 'inDOM') return;
            var clipboardContainer = this.$('.clipboard-container');
            if (clipboardContainer) clipboardContainer.empty().hide();
        }
    }),

    // Used to allow users to select text from read-only cells
    selectingReadOnly: Flame.State.extend({
        cancel: function(event) {
            this.get('owner')._cancelEditingOrSelecting();
            return true;
        },

        insertNewline: function(event) {
            var owner = this.get('owner');
            this.gotoFlameState('selected');
            owner.invokeStateMethod('moveDown');
        },

        moveLeft: function(event) {
            this._invokeInSelected('moveLeft');
        },

        moveRight: function(event) {
            this._invokeInSelected('moveRight');
        },

        moveDown: function(event) {
            this._invokeInSelected('moveDown');
        },

        moveUp: function(event) {
            this._invokeInSelected('moveUp');
        },

        insertTab: function(event) {
            this._invokeInSelected('insertTab');
        },

        insertBacktab: function(event) {
            this._invokeInSelected('insertBacktab');
        },

        deleteBackward: function(event) {
            this.gotoFlameState('selected');
            return true;
        },

        mouseDown: function(event) {
            var owner = this.get('owner');
            var cell = owner._cellForTarget(event.target);
            if (owner.isCellSelectable(cell)) {
                this.gotoFlameState('selected');
                owner.selectCell(cell);
                return true;
            } else {
                return false;
            }
        },

        enterState: function() {
            var owner = this.get('owner');
            var selection = owner.get('selection');
            var dataCell = owner.get('selectedDataCell');
            var readOnlyValue = Handlebars.Utils.escapeExpression(owner.editableValue(dataCell, true));
            this.selectionContent = selection.html();
            selection.html(readOnlyValue);
            selection.addClass('read-only is-selectable');
        },

        exitState: function() {
            var selection = this.get('owner.selection');
            selection.html(this.selectionContent);
            selection.removeClass('read-only is-selectable');
        },

        _invokeInSelected: function(action) {
            var owner = this.get('owner');
            this.gotoFlameState('selected');
            owner.invokeStateMethod(action);
        }
    }),

    editing: Flame.State.extend({
        cancel: function(event) {
            this.get('owner')._cancelEditingOrSelecting();
            return true;
        },

        moveLeft: function() {
            return Flame.ALLOW_BROWSER_DEFAULT_HANDLING;
        },

        moveRight: function() {
            return Flame.ALLOW_BROWSER_DEFAULT_HANDLING;
        },

        insertNewline: function(event) {
            var owner = this.get('owner');
            if (owner._confirmEdit()) {
                this.gotoFlameState('selected');
                owner.invokeStateMethod('moveDown');
            }
            return true;
        },

        insertTab: function(event) {
            var owner = this.get('owner');
            if (owner._confirmEdit()) {
                this.gotoFlameState('selected');
                owner.invokeStateMethod('insertTab');
            }
            return true;
        },

        insertBacktab: function(event) {
            var owner = this.get('owner');
            if (owner._confirmEdit()) {
                this.gotoFlameState('selected');
                owner.invokeStateMethod('insertBacktab');
            }
            return true;
        },

        mouseDown: function(event) {
            var owner = this.get('owner');
            var cell = owner._cellForTarget(event.target);
            var editField = owner.get('editField');
            if (owner.isCellSelectable(cell) && owner._confirmEdit()) {
                this.gotoFlameState('selected');
                owner.selectCell(cell);
                return true;
            } else if (!Ember.isEmpty(cell) && editField && cell[0] !== editField[0] && !owner._confirmEdit()) {
                editField.focus();
                return true;
            } else {
                return false;
            }
        },

        enterState: function() {
            var owner = this.get('owner');
            var selectedCell = owner.get('selectedCell');
            var dataCell = owner.get('selectedDataCell');
            var editCell = owner.get('editField');
            var selection = owner.get('selection');
            var options = dataCell.options();

            selectedCell.addClass('editing');

            if (!dataCell.showEditor(selectedCell, owner, owner.get('content'))) {
                // No special editor, use one of the defaults
                if (options) { // Drop down menu for fields with a fixed set of options
                    var menu = Flame.MenuView.createWithMixins({
                        minWidth: selectedCell.outerWidth(),
                        parent: owner, // Reference to the cube table view
                        items: options.map(function(o) {
                            return {
                                title: o.title,
                                value: o.value,
                                isChecked: o.value === dataCell.value,
                                action: function() { owner.didSelectMenuItem(this.get('value')); }
                            };
                        }),
                        // Make the cube table view go back to the selected state when the menu is closed
                        close: function() {
                            owner.gotoFlameState('selected');
                            this._super();
                        }
                    });
                    menu.popup(selectedCell);
                } else { // Normal edit field for everything else
                    var backgroundColor = selectedCell.css('backgroundColor');

                    // If background color is unset, it defaults to transparent. Different browser have different
                    // ways of saying "transparent". Let's assume "transparent" actually means "white".
                    if (['rgba(0, 0, 0, 0)', 'transparent'].contains(backgroundColor)) {
                        backgroundColor = 'white';
                    }

                    editCell.css({
                        left: parseInt(selection.css('left'), 10) + parseInt(selection.css('border-left-width'), 10) + 'px',
                        top: parseInt(selection.css('top'), 10) + parseInt(selection.css('border-top-width'), 10) + 'px',
                        width: selection.outerWidth() - parseInt(selection.css('border-left-width'), 10) - parseInt(selection.css('border-right-width'), 10) + 'px',
                        height: selection.outerHeight() - parseInt(selection.css('border-top-width'), 10) - parseInt(selection.css('border-bottom-width'), 10) + 'px',
                        backgroundColor: backgroundColor
                    });
                    var editValue = owner.editableValue(dataCell);
                    editCell.val(editValue);
                    editCell.attr('placeholder', dataCell.placeholder());
                    owner.set('editValue', null);
                    editCell.show();
                    // Put cursor at end of value
                    editCell.selectRange(editValue.length, editValue.length);
                }
            }
        },

        exitState: function() {
            var owner = this.get('owner');
            var editField = owner.get('editField');
            editField.hide();
            editField.removeClass('invalid');

            owner.get('selectedCell').removeClass('editing');
        }
    }),

    notifySelectionChange: function() {
        var tableViewDelegate = this.get('tableViewDelegate');
        if (tableViewDelegate && tableViewDelegate.didMakeSelection) {
            tableViewDelegate.didMakeSelection(
                this,
                this.get('selectedCell'),
                this.get('selectionEnd'),
                this.get('selectedDataCell')
            );
        }
    },

    didSelectMenuItem: function(value) {
        var editField = this.get('editField');
        editField.val(value || '');
        this._confirmEdit();
        this.invokeStateMethod('moveDown');
    },

    willLoseKeyResponder: function() {
        this.gotoFlameState('loaded');
    },

    columnIndex: function(cell) {
        return parseInt(cell.attr('data-index'), 10);
    },

    rowIndex: function(cell) {
        return parseInt(cell.parent().attr('data-index'), 10);
    },

    // Get the Cell instance that corresponds to the selected cell in the view
    selectedDataCell: function() {
        var selectedCell = this.get('selectedCell');
        return this.get('data')[this.rowIndex(selectedCell)][this.columnIndex(selectedCell)];
    }.property().volatile(),

    editableValue: function(dataCell, readOnly) {
        var editValue = this.get('editValue');
        if (editValue !== null) {
            return editValue;
        } else {
            editValue = readOnly ? dataCell.formattedValue() : dataCell.editableValue();
            return !Ember.isNone(editValue) ? editValue : '';
        }
    },

    didInsertElement: function() {
        this.set('selection', this.$('.table-selection'));
        this.set('editField', this.$('.table-edit-field'));
    },

    _selectionDidChange: function() {
        Ember.run.once(this, this._updateSelection);
    }.observes('selectedCell', 'selectionEnd'),

    _updateSelection: function() {
        var selectedCell = this.get('selectedCell');
        if (!selectedCell) return;

        var selection = this.get('selection');
        var scrollable = this.get('parentView.scrollable');
        var position = selectedCell.position();
        var scrollTop = scrollable.scrollTop();
        var scrollLeft = scrollable.scrollLeft();

        selectedCell.addClass('active-cell');
        selection.css(this._selectionCSS(selectedCell, this.get('selectionEnd'), scrollTop, scrollLeft, position));

        if (this.get('parentView.currentFlameState.name') === 'resizing') {
            return; // Scrolling the viewport used to mess up resizing columns when the selected cell was not in view
        }

        // Ensure the selection is within the visible area of the scrollview
        if (position.top < 0) {
            scrollable.scrollTop(scrollTop + position.top);
        } else if (position.top + selectedCell.outerHeight() > scrollable.outerHeight()) {
            var top = position.top + selectedCell.outerHeight() - scrollable.outerHeight();
            scrollable.scrollTop(top + scrollTop + 17);
        } else if (position.left < 0) {
            scrollable.scrollLeft(scrollLeft + position.left);
        } else if (position.left + selectedCell.outerWidth() > scrollable.outerWidth()) {
            var left = position.left + selectedCell.outerWidth() - scrollable.outerWidth();
            scrollable.scrollLeft(left + scrollLeft + 17);
        }
    },

    _selectionCSS: function(startCell, endCell, scrollTop, scrollLeft, position) {
        var offset = isWebKit ? 0 : 1;
        endCell = endCell || startCell;
        var startPosition = position;
        var endPosition = startCell === endCell ? position : endCell.position();

        var minLeft = Math.min(startPosition.left, endPosition.left);
        var minTop = Math.min(startPosition.top, endPosition.top);
        var maxLeft = Math.max(startPosition.left, endPosition.left);
        var maxTop = Math.max(startPosition.top, endPosition.top);

        var cellWidth = startPosition.left < endPosition.left ? endCell.outerWidth() : startCell.outerWidth();
        var cellHeight = startPosition.top < endPosition.top ? endCell.outerHeight() : startCell.outerHeight();

        return {
            left: minLeft + scrollLeft - offset,
            top: minTop + scrollTop - offset,
            width: maxLeft + cellWidth - minLeft - 5,
            height: maxTop + cellHeight - minTop - 3
        };
    },

    _selectionWillChange: function() {
        var selectedCell = this.get('selectedCell');
        if (selectedCell) {
            selectedCell.removeClass('active-cell');
        }
    }.observesBefore('selectedCell'),

    _confirmEdit: function() {
        var newValue = this.get('editField').val();
        if (!this._validateAndSet(newValue)) {
            this.get('editField').addClass('invalid');
            return false;
        }
        return true;
    },

    // Returns true if cell valid, or false otherwise
    _validateAndSet: function(newValue, cell) {
        var data = this.get('data');
        var selectedCell = cell || this.get('selectedCell');
        var columnIndex = this.columnIndex(selectedCell);
        var rowIndex = this.rowIndex(selectedCell);
        var dataCell = data[rowIndex][columnIndex];

        // Skip saving if value has not been changed
        if (Ember.compare(dataCell.editableValue(), newValue) === 0) {
            return true;
        } else if (dataCell.validate(newValue)) {
            var tableViewDelegate = this.get('tableViewDelegate');


            var index = [rowIndex, columnIndex];
            if (tableViewDelegate.cellUpdated(dataCell, newValue, index)) {
                var dirtyCells = this.get('dirtyCells').slice();
                dirtyCells.push([rowIndex, columnIndex]);
                this.set('dirtyCells', dirtyCells);
            }

            return true;
        } else {
            return false;
        }
    },

    _cancelEditingOrSelecting: function() {
        this.gotoFlameState('selected');
    },

    selectCell: function(newSelection, notify) {
        if (this.get('parentView.allowSelection') && this.isCellSelectable(newSelection)) {
            this.setProperties({
                selectedCell: newSelection,
                selectionEnd: newSelection
            });
            if (notify !== false) this.notifySelectionChange();
            return true;
        }
        return false;
    },

    isCellSelectable: function(cell) {
        return cell && cell[0] && cell[0].nodeName === 'TD';
    },

    _cellForTarget: function(target) {
        return jQuery(target).closest('td', this.$());
    },

    updateColumnWidth: function(index, width) {
        var cells = this.$('td[data-index=%@]'.fmt(index));
        cells.first().css('width', width);
        this.propertyDidChange('selectedCell'); // Let the size of the selection div be updated
    },

    render: function(buffer) {
        this.gotoFlameState('loaded');
        this._renderTable(buffer);
    },

    _renderTable: function(buffer) {
        var data = this.get('data');
        if (!(data && data[0])) return;

        var rowCount = data.length;
        var columnCount = data[0].length;
        var defaultCellWidth = this.get('parentView.defaultColumnWidth');
        var columnLeafs = this.get('parentView.content.columnLeafs');
        var cellWidth;
        var escape = Handlebars.Utils.escapeExpression;

        var classes = 'flame-table';
        if (!this.get('parentView.allowSelection')) classes += ' is-selectable';
        var div = document.createElement('div');
        buffer.begin('table').attr('class', classes).attr('width', '1px');
        buffer.pushOpeningTag();
        for (var i = 0; i < rowCount; i++) {
            buffer.push('<tr data-index="' + i + '">');
            for (var j = 0; j < columnCount; j++) {
                var content;
                var cell = data[i][j];
                var cssClassesString = '';
                var titleValue = '';
                var inlineStyles = '';
                if (cell) {
                    content = cell.content();
                    content = (Ember.isNone(content) ? '' : content);
                    if (content instanceof HTMLElement || content instanceof DocumentFragment) {
                        while (div.firstChild) div.removeChild(div.firstChild);
                        div.appendChild(content);
                        content = div.innerHTML;
                    } else {
                        // Escape the cell content unless there is a deliberate implementation for cells with HTML content.
                        content = escape(content);
                    }
                    cssClassesString = cell.cssClassesString();
                    if (cell.inlineStyles) inlineStyles = cell.inlineStyles();
                    titleValue = (cell.titleValue && cell.titleValue() ? 'title="%@"'.fmt(escape(cell.titleValue())) : '');
                } else {
                    content = '<span style="color: #999">...</span>';
                }
                cellWidth = columnLeafs[j].get('render_width') || defaultCellWidth;
                buffer.push('<td data-index="%@" class="%@" style="width: %@px; %@" %@>%@</td>'.fmt(
                    j,
                    (cssClassesString + (j % 2 === 0 ? ' even-col' : ' odd-col')),
                    cellWidth,
                    titleValue,
                    inlineStyles,
                    content
                ));
            }
            buffer.push('</tr>');
        }
        buffer.pushClosingTag(); // table

        // Selection indicator
        buffer.push('<div class="table-selection"></div>');

        // Edit field (text)
        buffer.push('<input type="text" class="table-edit-field">');

        // Container that will hold the textarea used for copy/pasting cells
        buffer.push('<div class="clipboard-container"></div>');
    },

    // Update dirty cells
    _cellsDidChange: function() {
        this.manipulateCells(this.get('dirtyCells'), function(cell, element, isEvenColumn) {
            var cssClassesString = (cell ? cell.cssClassesString() : '') + (isEvenColumn ? " even-col" : " odd-col");
            var content = cell.content();
            var titleValue = cell.titleValue && cell.titleValue();
            var inlineStyles = cell.inlineStyles ? cell.inlineStyles() : '';
            var cellWidth = element.style.width;
            if (!Ember.isNone(cellWidth)) inlineStyles = 'width: %@; %@'.fmt(cellWidth, inlineStyles);
            element.setAttribute('style', inlineStyles);
            element.className = cssClassesString;

            if (content instanceof HTMLElement || content instanceof DocumentFragment) {
                while (element.firstChild) element.removeChild(element.firstChild);
                element.appendChild(content);
            } else {
                element.textContent = Ember.isNone(content) ? '' : content;
            }

            if (titleValue) {
                element.title = titleValue;
            }
        }, ++this._updateCounter);
    }.observes('dirtyCells').on('init'),

    // Mark and disable updating cells
    _updatingCellsDidChange: function() {
        this.manipulateCells(this.get('cellsMarkedForUpdate'), function(cell, element, isEvenColumn) {
            if (cell.pending) {
                // Cell isn't loaded yet, insert a placeholder value
                cell.pending.isUpdating = true;
                element.className += (isEvenColumn ? ' even-col' : ' odd-col');
            } else {
                cell.isUpdating = true;
                var cssClassesString = cell.cssClassesString() + (isEvenColumn ? ' even-col' : ' odd-col');
                element.className = cssClassesString;
            }
        });
    }.observes('cellsMarkedForUpdate'),

    manipulateCells: function(cellRefs, callback, updateCounter) {
        var data = this.get('data');
        if (!cellRefs || cellRefs.length === 0 || !this.$()) return;
        var table = this.$('table.flame-table');

        var allCells = table.find('td');
        // Everyone expects that the cellRefs array is empty when we return from this function. We still need the
        // content so save it elsewhere.
        var content = cellRefs.splice(0, cellRefs.length);
        var updateBatchSize = this.get('batchUpdates') ? this.get('updateBatchSize') : -1;
        this._batchUpdate(updateBatchSize, 0, updateCounter, content, data, allCells, callback);
    },

    _batchUpdate: function(maxUpdates, startIx, updateCounter, cellRefs, data, allCells, callback) {
        if (typeof updateCounter !== 'undefined' && updateCounter !== this._updateCounter) return;
        // If we for some reason update / change the table before all these calls have gone through, we may update
        // nodes that no longer exist in DOM but that shouldn't cause problems.
        var len = cellRefs.length;
        var element, index, cell;
        var columnLength = data[0].length;
        // If maxUpdates is -1, we fetch everything in one batch
        var upTo = maxUpdates === -1 ? len : maxUpdates;

        for (var i = startIx; i < len && (i - startIx) < upTo; i++) {
            index = cellRefs[i];
            var x = index[0], y = index[1];
            if (!data[x][y]) {
                // Possibly updating a cell that's still being batch loaded, insert a placeholder for update attributes
                data[x][y] = {pending: {}};
            }
            cell = data[x][y];
            element = allCells[x * columnLength + y];
            if (element) {
                callback(cell, element, y % 2 === 0);
            }
        }
        if (i < len) {
            // We've still got some updating to do so let's do it in the next run loop. Thus we should not get any slow
            // script errors but that doesn't mean that the interface is responsive at any degree.
            var self = this;
            Ember.run.next(function() {
                self._batchUpdate(maxUpdates, i, updateCounter, cellRefs, data, allCells, callback);
            });
        }
    }
});

})();
(function() {
'use strict';


var alias = Ember.computed.alias;

var unbindScroll = function() {
    var scrollable = this.get('scrollable');
    if (scrollable) {
        scrollable.off('scroll');
    }
};

Flame.TableView = Flame.View.extend(Flame.Statechart, {
    MIN_COLUMN_WIDTH: 30,

    classNames: ['flame-table-view'],
    childViews: ['tableDataView'],
    displayProperties: ['contentAdapter.headers'],
    acceptsKeyResponder: false,

    // References to DOM elements
    scrollable: null, // the scrollable div that holds the data table
    rowHeader: null, // the row header table element
    columnHeader: null, // the column header table element
    tableCorner: null,

    renderColumnHeader: true,
    renderRowHeader: true,
    isRowHeaderClickable: true,
    isResizable: true,
    allowSelection: false,

    initialFlameState: 'idle',

    defaultColumnWidth: 88,
    rowHeaderWidth: null,
    content: null, // Set to a Flame.TableController
    allowRefresh: true,
    batchUpdates: true,
    useAutoWidth: false,
    tableViewDelegate: null,

    contentAdapter: function() {
        return Flame.TableViewContentAdapter.create({
            content: this.get('content')
        });
    }.property('content'),

    tableDataView: Flame.TableDataView.extend({
        dataBinding: 'parentView.content._data',
        content: alias('parentView.content'),
        dirtyCells: alias('parentView.content.dirtyCells'),
        areValuesOnRows: alias('parentView.content.areValuesOnRows'),
        totalRowIds: alias('parentView.content.totalRowIds'),
        totalColumnIds: alias('parentView.content.totalColumnIds'),
        tableViewDelegate: alias('parentView.tableViewDelegate'),
        cellsMarkedForUpdate: alias('parentView.content.cellsMarkedForUpdate'),
        batchUpdates: alias('parentView.batchUpdates')
    }),

    rowDepth: function() {
        return this.get('contentAdapter.rowHeaderRows.maxDepth');
    }.property('contentAdapter.rowHeaderRows'),

    /* IE 5-8 trigger mouse events in unorthodox order:

     IE 5-8:        Any sane browser:
     mousedown      mousedown
     mouseup        mouseup
     click          click
     mouseup        mousedown
     dblclick       mouseup
                    click
                    dblclick

     Normally, the dblclick event works as expected, because the mouseup event is not being triggered for idle state
     if mouseDown precedes it (because mouseup event is handled in resizing state). However, because IE8 triggers
     two mouseups but only one mousedown for a dblclick event, the mouseUp function is called for idle state - which
     in turn opens the sort order panel.

     By adding another state we can mitigate the issue. The mousedown event puts the view into clickInProgress
     state, and in clickInProgress mouseup returns it back to idle state. So, the state transition works as before.
     However, if user clicks the resize-handle the view goes to resizing state. The first mouseup event moves the view
     back to idle state, where the second redundant mouseup gets eaten silently.
    */
    idle: Flame.State.extend({
        mouseDown: function(event) {
            this.gotoFlameState('clickInProgress');

            var target = jQuery(event.target);
            if (target.is('div.resize-handle')) {
                var owner = this.get('owner');
                // If a table cell is being edited at this point, its 'editField' would get displaced by the resizing operation, so we just turn the editing off
                var tableDataView = owner.get('tableDataView');
                if (tableDataView.get('currentFlameState.name') === 'editing') {
                    tableDataView.cancel();
                }
                var cell = target.closest('td');
                owner.setProperties({
                    resizingCell: cell,
                    dragStartX: event.pageX,
                    startX: cell.get(0).clientWidth + 1,
                    offset: parseInt(this.get('owner.tableCorner').css('width'), 10),
                    type: cell.is('.column-header td') ? 'column' : 'row'
                });
                this.gotoFlameState('resizing');
                return true;
            } else if (!!target.closest('.column-header').length) {
                return true;
            } else if (target.is('a')) {
                return true;
            }

            return false;
        },

        doubleClick: function(event) {
            var owner = this.get('owner');
            if (!owner.get('useAutoWidth')) return false;

            var target = jQuery(event.target), index, header;
            if (!!target.closest('.column-header').length && (index = target.closest('td').attr('data-leaf-index'))) {
                header = this.get('owner.content.columnLeafs')[index];

                var columnDataAsString = owner.getColumnContents(header).map(function(e) { return e; }).join('<br>');
                var columnDimensions = Flame.measureString(columnDataAsString, 'ember-view');

                var isBold = target.closest('td').css('font-weight') === 'bold';
                var headerLabelDimensions = Flame.measureString(owner.getLeafHeaderLabel(header), 'ember-view', 'label', isBold ? 'font-weight:bold;' : '');

                var width = Math.max(columnDimensions.width, headerLabelDimensions.width) + 40;

                if (width < owner.MIN_COLUMN_WIDTH) width = owner.MIN_COLUMN_WIDTH;
                owner.setColumnWidth(header.leafIndex, width);
                var resizeDelegate = owner.get('tableViewDelegate');
                if (resizeDelegate && resizeDelegate.columnResized) {
                    resizeDelegate.columnResized(index, width);
                }
                return true;
            }
            return false;
        }
    }),

    clickInProgress: Flame.State.extend({
        mouseUp: function(event) {
            this.gotoFlameState('idle');
            var clickDelegate = this.get('owner.tableViewDelegate');
            if (clickDelegate) {
                var target = jQuery(event.target);
                var header;
                if (!!target.closest('.column-header').length) {
                    if (clickDelegate.columnHeaderClicked) {
                        // Find the corresponding TableHeader instance for the clicked cell.
                        var level = parseInt(target.closest('tr').attr('class').match(/level\-(\d+)/)[1], 10);
                        var row = this.get('owner.contentAdapter.columnHeaderRows')[level - 1];
                        header = row[target.closest('tr').find('td').index(target.closest('td'))];
                        clickDelegate.columnHeaderClicked(header, target);
                    }
                    return true;
                } else if (!!target.closest('.row-header').length) {
                    if (clickDelegate.rowHeaderClicked) {
                        var cell = target.closest('td');
                        var index = parseInt(cell.attr('data-index'), 10);
                        header = this.get('owner.content._headers.rowHeaders')[index];
                        if (!header) return false;
                        clickDelegate.rowHeaderClicked(header, target, index);
                    }
                    return true;
                }
            }

            return false;
        }
    }),

    resizing: Flame.State.extend({
        enterState: function() {
            var cell = this.get('owner.resizingCell');
            var $table = cell.closest('table');
            var columns = $table.find('col');

            if (this.get('owner.type') === 'column') {
                var column = parseInt(cell.attr('data-leaf-index'), 10);
                this.set('resizingColumn', columns.eq(column));
            } else {
                var totalDepth = columns.length;
                var cells = [];
                $table.find('td').each(function() {
                    var $cell = $(this);
                    if (!$cell.attr('colspan')) cells.push($cell);
                    if (cells.length === totalDepth) return false;
                });
                this.set('cells', cells);

                // Get column index for resized cell
                // must account for row headers spanning multiple columns to get the right leafIndex and width
                var remainingDepth = 0;
                cell.nextAll().each(function() {
                    remainingDepth += $(this).attr('colspan') || 1;
                });
                var leafIndex = totalDepth - remainingDepth - 1;

                this.set('resizingColumn', columns.eq(leafIndex));
                this.set('owner.resizingCell', cells[leafIndex]);
                this.set('owner.startX', cells[leafIndex].get(0).clientWidth + 1);
            }
        },

        mouseMove: function(event) {
            var owner = this.get('owner');
            var deltaX = event.pageX - owner.get('dragStartX');
            var minWidth = owner.get('MIN_COLUMN_WIDTH');
            var cellWidth = owner.get('startX') + deltaX;
            if (cellWidth < minWidth) cellWidth = minWidth;
            // Adjust size of the cell
            if (owner.get('type') === 'column') { // Update data table column width
                this.get('resizingColumn').css('width', cellWidth);
                owner._synchronizeColumnWidth(cellWidth);
            } else {
                var width = owner.get('offset') + cellWidth - owner.get('startX');

                // Move data table and column header
                owner.get('scrollable').css('left', width);
                owner.get('columnHeader').parent().css('left', width);
                owner.get('tableCorner').css('width', width);

                this.get('resizingColumn').css('width', cellWidth);
            }
        },

        mouseUp: function(event) {
            var owner = this.get('owner');
            var resizeDelegate = owner.get('tableViewDelegate');
            if (resizeDelegate) {
                var cell = owner.get('resizingCell');
                if (owner.get('type') === 'column' && resizeDelegate.columnResized) {
                    var width = parseInt(cell.css('width'), 10);
                    var index = parseInt(cell.attr('data-leaf-index'), 10);
                    resizeDelegate.columnResized(index, width);
                } else if (resizeDelegate.rowHeaderResized) {
                    // Can't use col-element to get the width from as it does not work correctly in IE
                    var widths = this.get('cells').map(function(cell) { return cell.outerWidth(); });
                    resizeDelegate.rowHeaderResized(widths);
                }
            }
            this.gotoFlameState('idle');
            return true;
        }
    }),

    setColumnWidth: function(columnIndex, cellWidth) {
        this.$('.column-header col').eq(columnIndex).css('width', cellWidth + 3);
        var table = this.objectAt(0);
        table.updateColumnWidth(columnIndex, cellWidth + 3);
    },

    _setColumnHeaderHeights: function(heights, columnRowHeight, tableTopMargin) {
        heights.forEach(function(value, index) {
            // Get header row
            var $tr = this.$('.column-header .level-' + (index + 1));
            $tr.find('.content-container').css('height', value * columnRowHeight);
            $tr.find('.resize-handle').css('height', value * columnRowHeight - 1);
            $tr.find('.label').css('white-space', value === 1 ? 'nowrap' : 'normal');
        }, this);

        var totalHeight = 2 + heights.length - 1;
        heights.forEach(function(h) {
            totalHeight += h * columnRowHeight;
        });

        // Update offset of scrollable
        this.$('.scrollable').css('top', totalHeight + tableTopMargin);
        // Update size of table corner
        this.$('.table-corner').css('height', totalHeight);
        // Update offset of row headers
        this.$('.row-header').css('top', totalHeight + tableTopMargin);
    },

    getColumnContents: function(columnHeader) {
        return this.get('content.tableData').map(function(e) {
            var elem = e[columnHeader.leafIndex];
            return Ember.isNone(elem) ? '' : elem.formattedValue();
        });
    },

    getLeafHeaderLabel: function(header) {
        var leaf = this.get('content.columnLeafs')[header.leafIndex];
        return leaf.get('headerLabel');
    },

    _synchronizeColumnWidth: function(width) {
        // Update data table columns
        var cell = this.get('resizingCell');
        var table = this.objectAt(0);
        var index = parseInt(cell.attr('data-leaf-index'), 10);
        table.updateColumnWidth(index, width);
    },

    willInsertElement: unbindScroll,
    willDestroyElement: unbindScroll,

    didInsertElement: function() {
        this.set('scrollable', this.$('.scrollable'));
        this.set('rowHeader', this.$('.row-header table'));
        this.set('columnHeader', this.$('.column-header table'));
        this.set('tableCorner', this.$('.table-corner'));
        this.get('scrollable').on('scroll', jQuery.proxy(this.didScroll, this));
    },

    isScrolling: false,
    didScroll: function(event) {
        var scrollable = this.get('scrollable');
        this.lastScrollTop = scrollable.scrollTop();
        this.lastScrollLeft = scrollable.scrollLeft();
        if (!this.isScrolling) {
            requestAnimationFrame(jQuery.proxy(this._updateHeaderPositions, this));
        }
        this.isScrolling = true;
    },

    _updateHeaderPositions: function() {
        if (this.lastScrollTop !== this.lastSetScrollTop) {
            this.get('rowHeader').css('top', -this.lastScrollTop);
            this.lastSetScrollTop = this.lastScrollTop;
        }
        if (this.lastScrollLeft !== this.lastSetScrollLeft) {
            this.get('columnHeader').css('left', -this.lastScrollLeft);
            this.lastSetScrollLeft = this.lastScrollLeft;
        }
        this.isScrolling = false;
    },

    render: function(buffer) {
        var renderColumnHeader = this.get('renderColumnHeader');
        var renderRowHeader = this.get('renderRowHeader');
        var didRenderTitle = false;

        var headers = this.get('contentAdapter.headers');
        if (!headers) {
            return; // Nothing to render
        }

        if (this.get('content.title')) {
            buffer.push('<div class="panel-title">%@</div>'.fmt(Handlebars.Utils.escapeExpression(this.get('content.title'))));
            didRenderTitle = true;
        }

        var defaultColumnWidth = this.get('defaultColumnWidth');
        var defaultRowHeaderWidth = this.get('rowHeaderWidth') || defaultColumnWidth;
        var rowHeaderWidths = this.get('content').rowHeaderWidths ? this.get('content').rowHeaderWidths() : null;

        var columnHeaderRows = this.get('contentAdapter.columnHeaderRows');
        var rowHeaderRows = this.get('contentAdapter.rowHeaderRows');
        var columnHeaderHeight = columnHeaderRows.maxDepth * 21 + 1 + columnHeaderRows.maxDepth;
        var leftOffset = 0;
        if (renderRowHeader) {
            if (rowHeaderWidths) {
                var totalWidth = 0;
                for (var i = 0; i < Math.max(rowHeaderRows.maxDepth, 1); i++) {
                    totalWidth += isNaN(rowHeaderWidths[i]) ? defaultRowHeaderWidth : rowHeaderWidths[i];
                }
                leftOffset = totalWidth + 1 + (renderColumnHeader ? 0 : 5);
            } else {
                leftOffset = rowHeaderRows.maxDepth * defaultRowHeaderWidth + 1 + (renderColumnHeader ? 0 : 5);
            }
        }
        var topOffset = didRenderTitle ? 18 : 0;

        if (renderColumnHeader) {
            // Top left corner of the headers
            buffer.push('<div class="table-corner" style="top: %@px; left: 0; height: %@px; width: %@px;"></div>'.fmt(topOffset, columnHeaderHeight, leftOffset));
            // Column headers
            this._renderHeader(buffer, 'column', leftOffset, defaultColumnWidth);
            topOffset += columnHeaderHeight;
        }
        if (renderRowHeader) {
            // Row headers
            this._renderHeader(buffer, 'row', topOffset, defaultRowHeaderWidth);
        }

        // Scrollable div
        buffer.push('<div class="scrollable" style="overflow: auto; bottom: 0; top: %@px; left: %@px; right: 0;">'.fmt(topOffset, leftOffset));
        // There should really only be one child view, the TableDataView
        this.forEach(function(view) {
            view.renderToBuffer(buffer);
        });
        buffer.push('</div>');
    },

    _renderHeader: function(buffer, type, offset, defaultColumnWidth) {
        var headers = this.get('contentAdapter.headers');
        if (!headers) {
            buffer.push('<div></div>');
            return;
        }

        var position, i;
        if (type === 'column') {
            headers = this.get('contentAdapter.columnHeaderRows');
            position = 'left';
        } else {
            headers = this.get('contentAdapter.rowHeaderRows');
            position = 'top';
        }
        var length = headers.length;

        buffer.begin('div').addClass('%@-header'.fmt(type)).attr('style', 'position: absolute; %@: %@px'.fmt(position, offset));
        buffer.pushOpeningTag();
        buffer.begin('table').attr('style', 'position: absolute').attr('width', '1px');
        buffer.pushOpeningTag();

        buffer.push('<colgroup>');
        if (type === 'row') {
            var widths = this.get('content').rowHeaderWidths ? this.get('content').rowHeaderWidths() : null;
            for (i = 0; i < (headers.maxDepth || 1); i++) {
                var width = (widths && widths[i]) ? widths[i] : defaultColumnWidth;
                buffer.push('<col style="width: %@px;" class="level-%@">'.fmt(width, i + 1));
            }
        } else {
            var l = this.get('content.columnLeafs').length;
            for (i = 0; i < l; i++) {
                buffer.push('<col style="width: %@px;">'.fmt(this.get('content.columnLeafs')[i].get('render_width') || defaultColumnWidth));
            }
        }
        buffer.push('</colgroup>');

        for (i = 0; i < length; i++) {
            if (type === 'column') {
                buffer.push('<tr class="level-%@">'.fmt(i + 1));
            } else {
                buffer.push('<tr>');
            }
            this._renderRow(buffer, headers[i], type, i);
            buffer.push('</tr>');
        }

        buffer.pushClosingTag(); // table
        buffer.pushClosingTag(); // div
    },

    _renderRow: function(buffer, row, type, rowIndex) {
        var length = row.length;
        var label, sortDirection, headerLabel;

        function countLeaves(headerNode) {
            if (headerNode.hasOwnProperty('children')) {
                var count = 0;
                for (var idx = 0; idx < headerNode.children.length; idx++) {
                    count += countLeaves(headerNode.children[idx]);
                }
                return count;
            } else {
                return 1;
            }
        }

        for (var i = 0; i < length; i++) {
            var header = row[i];
            buffer.begin('td');

            headerLabel = header.get ? header.get('headerLabel') : header.label;
            if (!headerLabel) headerLabel = "";
            // We have to support <br> for row headers, so we'll replace them back after escaping
            headerLabel = Ember.Handlebars.Utils.escapeExpression(headerLabel).replace(/&lt;br&gt;/g, '<br>');
            buffer.attr('title', headerLabel.replace(/<br>/g, '\n'));

            if (header.rowspan > 1) {
                buffer.attr('rowspan', header.rowspan);
            }
            if (header.colspan > 1) {
                buffer.attr('colspan', header.colspan);
            }

            label = '<div class="label">%@</div>';
            var resizeHandle = "";
            buffer.attr('class', (i % 2 === 0 ? "even-col" : "odd-col"));
            if (type === 'column' && !header.hasOwnProperty('children')) { // Leaf node
                buffer.attr('data-index', i);
                // Mark the leafIndex, so when sorting it's trivial to find the correct field to sort by
                buffer.attr('data-leaf-index', header.leafIndex);
                if (this.get('isResizable') && this.get('renderColumnHeader')) {
                    resizeHandle = '<div class="resize-handle">&nbsp;</div>';
                }

                var headerSortDelegate = this.get('tableViewDelegate');
                if (headerSortDelegate && headerSortDelegate.getSortForHeader) {
                    var activeSort = headerSortDelegate.getSortForHeader(header);
                    sortDirection = activeSort ? activeSort.direction : null;
                }
                var sortClass = sortDirection ? 'sort-%@'.fmt(sortDirection) : '';
                label = '<div class="label ' + sortClass + '">%@</div>';
            } else if (type === 'row') {
                buffer.attr('data-index', header.dataIndex);
                if (this.get('renderColumnHeader')) {
                    if (this.get("isResizable")) {
                        if (header.hasOwnProperty('children')) {
                            // Ensure that resize-handle covers the whole height of the cell border. Mere child count
                            // does not suffice with multi-level row headers.
                            var leafCount = countLeaves(header);
                            resizeHandle = '<div class="resize-handle" style="height: %@px"></div>'.fmt(leafCount * 21);
                        } else {
                            resizeHandle = '<div class="resize-handle"></div>';
                        }
                    }
                    if (this.get('isRowHeaderClickable') && header.get('isClickable')) {
                        label = '%@';
                    }
                }
            }

            buffer.pushOpeningTag(); // td
            buffer.push('<div class="content-container">');
            buffer.push(resizeHandle);
            buffer.push(label.fmt(headerLabel));
            buffer.push('</div>');
            buffer.pushClosingTag(); // td
        }
    }
});

})();
(function() {
'use strict';

Flame.TextAreaView = Flame.View.extend({
    classNames: ['flame-text'],
    childViews: ['textArea'],
    layout: { left: 0, top: 0 },
    defaultHeight: 20,
    defaultWidth: 200,
    acceptsKeyResponder: true,

    value: '',
    placeholder: null,
    isValid: null,
    isVisible: true,
    isDisabled: false,
    readonly: false,

    becomeKeyResponder: function() {
        this.get('textArea').becomeKeyResponder();
    },

    textArea: Ember.TextArea.extend(Flame.EventManager, Flame.FocusSupport, {
        classNameBindings: ['isInvalid', 'isFocused'],
        acceptsKeyResponder: true,
        // Start from a non-validated state. 'isValid' being null means that it hasn't been validated at all (perhaps
        // there's no validator attached) so it doesn't make sense to show it as invalid.
        isValid: null,
        isInvalid: Ember.computed.equal('isValid', false),
        value: Ember.computed.alias('parentView.value'),
        placeholder: Ember.computed.alias('parentView.placeholder'),
        isVisible: Ember.computed.alias('parentView.isVisible'),
        disabled: Ember.computed.alias('parentView.isDisabled'),
        readonly: Ember.computed.alias('parentView.readonly'),

        keyDown: function() { return false; },
        keyUp: function() {
            this._elementValueDidChange();
            return false;
        }
    })
});

})();
(function() {
'use strict';

/*
  A child view in a TreeView. In most cases you don't need to extend this, you can instead define
  a handlebarsMap on the tree view. If you want to use a custom view instead of handlebars, consider
  extending this class and defining a custom treeItemViewClass (see below). If you do need to override
  the rendering directly in this class, you should note that you're then responsible for rendering
  also the nested list view (and a toggle button if you want one).

  TODO Should perhaps extract the class definition used in treeItemViewClass into a separate subclass
       for easier extending.
 */

Flame.TreeItemView = Flame.ListItemView.extend({
    useAbsolutePositionBinding: 'parentView.rootTreeView.useAbsolutePositionForItems',
    classNames: ['flame-tree-item-view'],
    classNameBindings: ['parentView.nestingLevel'],
    isExpanded: function(key, value) {
        if (arguments.length === 1) {
            if (this._isExpanded !== undefined) return this._isExpanded;
            return this.get('content.treeItemIsExpanded') || this.get('defaultIsExpanded');
        } else {
            this._isExpanded = value;
            return value;
        }
    }.property('content.treeItemIsExpanded', 'defaultIsExpanded'),
    layout: { left: 0, right: 0, top: 0, height: 0 },

    defaultIsExpanded: function() {
        return this.get('parentView.rootTreeView.defaultIsExpanded');
    }.property('parentView.rootTreeView.defaultIsExpanded'),

    // Don't use the list view isSelected highlight logic
    isSelected: function(key, value) {
        return false;
    }.property(),

    // This is the highlight logic for tree items, the is-selected class is bound to the flame-tree-item-view-container
    classAttribute: function() {
        return this.get('content') === this.get('parentView.rootTreeView.selection') ? 'flame-tree-item-view-container is-selected' : 'flame-tree-item-view-container';
    }.property('content', 'parentView.rootTreeView.selection'),

    // The HTML that we need to produce is a bit complicated, because while nested items should appear
    // indented, the selection highlight should span the whole width of the tree view, and should not
    // cover possible nested list view that shows possible children of this item. The div with class
    // flame-tree-item-view-container is meant to display the selection highlight, and the div with class
    // flame-tree-item-view-pad handles indenting the item content. Possible nested list comes after.
    //
    // TODO It seems using handlebars templates is quite a bit slower than rendering programmatically,
    //      which is very much noticeable in IE7. Should probably convert to a render method.
    handlebars: '<div {{bind-attr class="view.classAttribute"}}><div class="flame-tree-item-view-pad">' +
            '{{#if view.hasChildren}}{{view view.toggleButton}}{{/if}}' +
            '{{view view.treeItemViewClass content=view.content}}</div></div>' +
            '{{#if view.renderSubTree}}{{view view.nestedTreeView}}{{/if}}',

    /**
     * Do we want to create the view for the subtree? This will return true if there is a subtree and it has
     * been shown at least once.
     *
     * Thus the view for the subtree is created lazily and never removed. To achieve the laziness, this property is
     * updated by _updateSubTreeRendering and cached.
     */
    renderSubTree: function() {
        return this.get("hasChildren") && this.get("isExpanded");
    }.property(),

    /**
     * Force updating of renderSubTree when we need to create the subview.
     */
    _updateSubTreeRendering: function() {
        var show = this.get("renderSubTree");
        if (!show && this.get("isExpanded") && this.get("hasChildren")) {
            this.propertyWillChange("renderSubTree");
            this.propertyDidChange("renderSubTree");
        }
    }.observes("hasChildren", "isExpanded"),

    // This view class is responsible for rendering a single item in the tree. It's not the same thing as
    // the itemViewClass, because in the tree view that class is responsible for rendering the item AND
    // possible nested list view, if the item has children.
    treeItemViewClass: Flame.View.extend({
        useAbsolutePosition: false,
        layout: { top: 0, left: 0, right: 0, height: 20 },
        classNames: ['flame-tree-item-view-content'],
        contentIndexBinding: 'parentView.contentIndex',
        handlebars: function() {
            return this.get('parentView.parentView.rootTreeView').handlebarsForItem(this.get('content'));
        }.property('content')
    }),

    /**
     * Get the immediate parent-view of all the TreeItemViews that are under this view in the tree. If no child views
     * are currently shown, return null.
     * The implementation of this method is intimately tied to the view structure defined in 'handlebars'-property.
     *
     * @returns {Ember.View} view that is the parent of all the next level items in the tree.
     */
    childListView: function() {
        if (this.get("renderSubTree")) {
            // Is there a nicer way to get in touch with child list? This is a bit brittle.
            return this.get('lastObject.firstObject');
        }
        return null;
    }.property("showsubTree"),

    hasChildren: function() {
        return !Ember.isNone(this.get('content.treeItemChildren'));
    }.property('content.treeItemChildren').volatile(),

    mouseUp: function() {
        if (this.get('parentView.rootTreeView.clickTogglesIsExpanded')) {
            this.toggleProperty('isExpanded');
        }
        return false;  // Always propagate to ListItemView
    },

    // The view class displaying a disclosure view that allows expanding/collapsing possible children
    toggleButton: Flame.DisclosureView.extend({
        classNames: ['flame-tree-view-toggle'],
        ignoreLayoutManager: true,
        useAbsolutePosition: false,
        acceptsKeyResponder: false,
        visibilityTargetBinding: 'parentView.isExpanded',
        action: function() { return false; }  // Allow click to propagate to the parent
    }),

    // The view class for displaying possible nested list view, in case this item has children.
    // TODO Don't create a new CLASS EACH AND EVERY TIME this property is called! Using just a cacheable won't do
    // because then a new class would still be created for each instance of a Tree.
    nestedTreeView: function() {
        return Flame.TreeView.extend({
            useAbsolutePosition: this.get('parentView.rootTreeView.useAbsolutePositionForItems'),
            layoutManager: Flame.VerticalStackLayoutManager.create({ topMargin: 0, spacing: 0, bottomMargin: 0 }),
            layout: { top: 0, left: 0, right: 0 },
            classNames: ['flame-tree-view-nested'],
            isVisible: Ember.computed.bool('parentView.isExpanded'), // Ember isVisible handling considers undefined to be visible
            allowSelection: this.get('parentView.rootTreeView.allowSelection'),
            allowReordering: this.get('parentView.rootTreeView.allowReordering'),
            content: this.get('content.treeItemChildren'),
            itemViewClass: this.get('parentView.rootTreeView.itemViewClass'),
            isNested: true
        });
    }.property('content').volatile()
});

})();
(function() {
'use strict';




/*
  A tree view displays a hierarchy of nested items. The items may all be of the same type, or there can be several
  types of items (e.g. folders and files). Tree view internally uses nested ListViews. Items with subitems can be
  expanded and collapsed.

  If allowReordering is true, items can be reordered by dragging. It is possible to drag items from one container
  to another and also between levels (e.g. from a container to its parent). Reordering is done live so that at any
  given time, user will see what the resulting order is, should they choose to release the mouse button.

  The most important properties for configuring a tree view are:

   - content: A list of the top-level items. For each item, property treeItemChildren defines its children, if any.
   - selection: The selected item in the content array or one of the children or grand-children.
   - allowSelection: Whether user can select items.
   - allowReordering: Whether user can reorder items by dragging.
   - handlebarsMap: A map of handlebars templates to use for rendering the items, for each different type. For example:
        handlebarsMap: {
            'App.Folder': '{{view.content.name}} ({{view.content.treeItemChildren.length}} reports)',
            'App.Report': '{{view.content.name}}',
            defaultTemplate: '{{view.content.title}}'
        }

  If you don't want to use handlebars templates for the item views, you can alternatively define property
  'itemViewClass', which will then be used for all item types and levels. The class you name must extend
  Flame.TreeItemView, and must also render the nested list view. See comments in TreeItemView for more info.

  TODO:
   - when selection changes, scroll the selected item to be fully visible (esp. important for keyboard selection)
   - create the nested list views lazily upon expanding (would speed up initial rendering for big trees)
   - IE testing/support
   - Syncing reorderings back to the tree content source
   - keyboard support
 */

Flame.TreeView = Flame.ListView.extend({
    classNames: ['flame-tree-view'],
    classNameBindings: ['isNested', 'nestingLevel'],
    defaultIsExpanded: false,
    itemViewClass: Flame.TreeItemView,
    isNested: false,
    clickTogglesIsExpanded: true,
    /* Whether to use absolute positioning for the items and nested lists. Currently it makes things quite tricky
       and should be avoided at all cost (don't expect everything to work just by turning this on, you will likely
       need to override the itemViewClass as well). */
    useAbsolutePositionForItems: false,

    handlebarsForItem: function(item) {
        var handlebarsMap = this.get('handlebarsMap') || {};
        return handlebarsMap[item.constructor.toString()] || handlebarsMap.defaultTemplate;
    },

    nestingLevel: function() {
        return 'level-%@'.fmt(this.get('treeLevel'));
    }.property('treeLevel').volatile(),

    // Propagates selection to the parent. This way we can make sure that only exactly one of the nested
    // list views is showing a selection (see property isTreeItemSelected in TreeItemView)
    _treeSelectionDidChange: function() {
        var selection = this.get('selection');
        var parentTreeView = this.get('parentTreeView');
        if (selection && parentTreeView) {
            parentTreeView.set('selection', selection);
            this.set('selection', undefined);
        }
    }.observes('selection'),

    // If this is a nested tree view, propagate the call to the parent, accumulating path to the item
    startReordering: function(dragHelper, event) {
        var parentTreeView = this.get('parentTreeView');
        if (parentTreeView) {
            dragHelper.get('itemPath').insertAt(0, this.get('parentView.contentIndex'));
            parentTreeView.startReordering(dragHelper, event);
        } else {
            Flame.set('mouseResponderView', this);  // XXX a bit ugly...
            this._super(dragHelper, event);
        }
    },

    treeLevel: function() {
        return (this.get('parentTreeView.treeLevel') || 0) + 1;
    }.property('parentTreeView.treeLevel').volatile(),

    parentTreeView: function() {
        return this.get('isNested') ? this.get('parentView.parentView') : undefined;
    }.property('isNested', 'parentView.parentView').volatile(),

    rootTreeView: function() {
        return this.get('parentTreeView.rootTreeView') || this;
    }.property('parentTreeView.rootTreeView').volatile()

});

})();
(function() {
'use strict';



/**
  VerticalSplitView divides the current view between leftView and rightView using a vertical
  dividerView.
*/

Flame.VerticalSplitView = Flame.SplitView.extend({
    classNames: ['flame-vertical-split-view'],
    childViews: ['leftView', 'dividerView', 'rightView'],
    leftWidth: 100,
    rightWidth: 100,
    minLeftWidth: 0,
    minRightWidth: 0,
    flex: 'right',

    _unCollapsedLeftWidth: undefined,
    _unCollapsedRightWidth: undefined,
    _resizeStartX: undefined,
    _resizeStartLeftWidth: undefined,
    _resizeStartRightWidth: undefined,

    init: function() {

        this._super();

        if (this.get('flex') === 'right') this.set('rightWidth', undefined);
        else this.set('leftWidth', undefined);
    },

    _updateLayout: function() {
        var leftView = this.get('leftView');
        var dividerView = this.get('dividerView');
        var rightView = this.get('rightView');

        var totalWidth = this.$().innerWidth();
        var dividerThickness = this.get('dividerThickness');
        var leftWidth = this.get('flex') === 'right' ? this.get('leftWidth') : undefined;
        var rightWidth = this.get('flex') === 'left' ? this.get('rightWidth') : undefined;
        if (leftWidth === undefined && rightWidth !== undefined && totalWidth !== null && totalWidth !== 0) leftWidth = totalWidth - rightWidth - dividerThickness;
        if (rightWidth === undefined && leftWidth !== undefined && totalWidth !== null && totalWidth !== 0) rightWidth = totalWidth - leftWidth - dividerThickness;

        if (typeof leftWidth === 'number' && leftWidth < this.get('minLeftWidth')) {
            rightWidth += leftWidth - this.get('minLeftWidth');
            leftWidth = this.get('minLeftWidth');
        }
        if (typeof rightWidth === 'number' && rightWidth < this.get('minRightWidth')) {
            leftWidth += rightWidth - this.get('minRightWidth');
            rightWidth = this.get('minRightWidth');
        }
        this.set('leftWidth', leftWidth);
        this.set('rightWidth', rightWidth);

        if (this.get('flex') === 'right') {
            this._setDimensions(leftView, 0, leftWidth, '');
            this._setDimensions(dividerView, leftWidth, dividerThickness, '');
            this._setDimensions(rightView, leftWidth + dividerThickness, '', 0);
        } else {
            this._setDimensions(leftView, 0, '', rightWidth + dividerThickness);
            this._setDimensions(dividerView, '', dividerThickness, rightWidth);
            this._setDimensions(rightView, '', rightWidth, 0);
        }
    }.observes('leftWidth', 'rightWidth', 'minLeftWidth', 'minRightWidth'),

    _setDimensions: function(view, left, width, right) {
        view.get('layout').setProperties({
            left: left,
            width: width,
            right: right,
            top: 0,
            bottom: 0
        });
        view.updateLayout();
    },

    toggleCollapse: function(event) {
        if (!this.get('allowResizing')) return;

        if (this.get('flex') === 'right') {
            if (this.get('leftWidth') === this.get('minLeftWidth') && this._unCollapsedLeftWidth !== undefined) {
                this.set('leftWidth', this._unCollapsedLeftWidth);
            } else {
                this._unCollapsedLeftWidth = this.get('leftWidth');
                this.set('leftWidth', this.get('minLeftWidth'));
            }
        } else {
            if (this.get('rightWidth') === this.get('minRightWidth') && this._unCollapsedRightWidth !== undefined) {
                this.set('rightWidth', this._unCollapsedRightWidth);
            } else {
                this._unCollapsedRightWidth = this.get('rightWidth');
                this.set('rightWidth', this.get('minRightWidth'));
            }
        }
    },

    startResize: function(event) {
        this._resizeStartX = event.pageX;
        this._resizeStartLeftWidth = this.get('leftWidth');
        this._resizeStartRightWidth = this.get('rightWidth');
    },

    resize: function(event) {
        if (this.get('flex') === 'right') {
            this.set('leftWidth', this._resizeStartLeftWidth + (event.pageX - this._resizeStartX));
        } else {
            this.set('rightWidth', this._resizeStartRightWidth - (event.pageX - this._resizeStartX));
        }
    }
});

})();
(function() {
'use strict';




Flame.Validator = Ember.Object.extend({
    /**
      @param {Object} target the target object
      @param {String} key the target object property
      @returns {Boolean} validation status
    */
    validate: function(target, key) {
        return true;
    },

    validateValue: function(value) {
        return this.validate(Ember.Object.create({value: value}), 'value');
    },

    /**
      @returns {String} the property which the validator will set the result of the validation.
    */
    isValidProperty: function(key) {
        return key + 'IsValid';
    }
});

/**
  Mix this in to your model object to perform on the fly validation.
  You must provide a 'validations' hash, with the keys defining each property of your model to validate,
  and the values the validation logic.

  The validation logic should be defined either as a Flame validator singleton, an anonymous function, or a hash.

  Validation is done on-demand, demand being the first call to foo.get("barIsValid") or foo.get("isValid").
  Thus we don't validate stuff that just goes to DataStore but only the thing we use and about whose validity we're
  interested in.

  If you define 'Coupled properties' for a property foo, this means that when foo has changed, we need to revalidate not
  just foo but also each coupled property. For example, if we have properties password and passwordCheck, when we
  edit password we need to revalidate the validation for passwordCheck also.

  Validations can only be set once to the object (this is usually done in the definition of the objects class).
*/
Flame.Validatable = Ember.Mixin.create({
    _propertyValidity: null,
    _objectIsValid: null,
    _validations: null,

    isValidProperty: function(property) {
        return property + 'IsValid';
    },

    // The observer calls this method with a value, so we have to add ignoreCoupledProperties afterwards
    validateProperty: function(target, key, value, ignoreCoupledProperties) {
        if (Ember.isNone(ignoreCoupledProperties)) {
            ignoreCoupledProperties = false;
        }
        if (value === undefined) {
            value = target.get(key);
        }
        var validationObj = target.get('validations')[key];
        var coupledProperties = null;
        if (jQuery.isPlainObject(validationObj)) {
            var hash = validationObj;
            validationObj = hash.validation;
            coupledProperties = hash.coupledProperties;
        }

        var isValid;
        if (!jQuery.isArray(validationObj)) {
            validationObj = [validationObj];
        }
        for (var i = 0; i < validationObj.length; i++) {
            if (!(isValid = this._validate(validationObj[i], target, key, value))) {
                break;
            }
        }
        var isValidProperty = this.isValidProperty(key);
        target.beginPropertyChanges();
        target.set(isValidProperty, isValid);
        // Coupled properties are properties that should be revalidated if the original property changes
        if (!ignoreCoupledProperties && coupledProperties) {
            if (!jQuery.isArray(coupledProperties)) {
                throw new Error('Hint: coupledProperties must be an array!');
            }
            for (var j = 0; j < coupledProperties.length; j++) {
                var coupledProperty = coupledProperties[j];
                if (coupledProperty !== key) {
                    this.validateProperty(this, coupledProperty, undefined, true);
                }
            }
        }
        target.set('isValid', target._checkValidity());
        target.endPropertyChanges();
    },

    invalidProperties: function() {
        var invalids = [];
        var validations = this.get("validations");
        for (var key in validations) {
            if (this.get(this.isValidProperty(key)) !== true) {
                invalids.push(key);
            }
        }
        return invalids;
    }.property().volatile(),

    _validate: function(validator, target, key, value) {
        var isValid = null;
        if (validator instanceof Flame.Validator) {
            isValid = validator.validate(target, key);
        } else if (!Ember.isNone(validator)) {
            // if not Flame.Validator, assume function
            isValid = validator.call(this, value);
        }
        return isValid;
    },

    /**
      @returns {Boolean} to indicate if all properties of model are valid.
    */
    _checkValidity: function(forceRevalidation) {
        var validations = this.get("validations");
        for (var key in validations) {
            if (forceRevalidation) {
                this.validateProperty(this, key, this.get(key));
            }
            if (validations.hasOwnProperty(key) && this.get(this.isValidProperty(key)) !== true) {
                return false;
            }
        }
        return true;
    },

    isValid: function(key, val) {
        if (typeof val !== "undefined") {
            this._objectIsValid = val;
        }
        if (this._objectIsValid === null) { // If we haven't initialized this property yet.
            this._objectIsValid = this._checkValidity();
        }
        return this._objectIsValid;
    }.property().volatile(),

    /**
      Allow setting of validations only once. Validations set through this property are ignored after they've been
      set once.
    */
    validations: function(key, val) {
        if (!Ember.isNone(val)) {
            if (this._validations === null) {
                this._validations = val;
            } else {
                Ember.Logger.info('Trying to set validations after the validations have already been set!');
            }
        }
        return this._validations;
    }.property().volatile(),

    /**
      Create all the *isValid properties this object should have based on its validations-property.
    */
    _createIsValidProperties: function() {
        var validations = this.get('validations');
        var propertyName;
        // TODO do this without setting computer properties, using only simple properties (i.e. the kind 'foo' is when
        // defined like Ember.Object({foo: false}).
        for (propertyName in validations) {
            if (validations.hasOwnProperty(propertyName)) {
                this._createIsValidProperty(propertyName);
            }
        }
        for (propertyName in validations) {
            if (validations.hasOwnProperty(propertyName)) {
                this.addObserver(propertyName, this, 'validateProperty');
                this.validateProperty(this, propertyName);
            }
        }
    },

    _createIsValidProperty: function(propertyName) {
        if (this._propertyValidity === null) this._propertyValidity = {};
        var self = this;
        Ember.defineProperty(this, this.isValidProperty(propertyName), Ember.computed(function(propertyIsValidName, value) {
            // Emulate common property behaviour where setting undefined value does nothing.
            if (typeof value !== "undefined") {
                self.propertyWillChange(propertyIsValidName);
                self._propertyValidity[propertyIsValidName] = value;
                self.propertyDidChange(propertyIsValidName);
            }
            return self._propertyValidity[propertyIsValidName];
        }).property().volatile());
    },

    /**
      Add validation for
      @param {String} propertyName Name of the property we want to validate.
      @param {Object} validator Flame.Validator or function that will handle the validation of this property.
    */
    setValidationFor: function(propertyName, validator) {
        // TODO do this without setting computed properties, using only simple properties (i.e. the kind 'foo' is when
        // defined with Ember.Object({foo: false}).

        var validations = this.get('validations');
        if (validations === this.constructor.prototype.validations || validations === null) {
            // ensure that setValidationFor does not mess with prototype-defined validations
            validations = jQuery.extend({}, validations);
            this.set('validations', validations);
        }
        validations[propertyName] = validator;
        this._createIsValidProperty(propertyName);
        this.removeObserver(propertyName, this, 'validateProperty'); // In case we're redefining the validation
        this.addObserver(propertyName, this, 'validateProperty');
        this.validateProperty(this, propertyName);
    },

    unknownProperty: function(key) {
        var res = /^(.+)IsValid$/.exec(key);
        var validations = this.get('validations');
        if (res && validations) {
            var propertyName = res[1];
            if (validations[propertyName]) {
                this._createIsValidProperties();
                return this.get(key);
            }
        }

        // Standard bailout, either the property wasn't of the form fooIsValid or we don't have property foo in
        // this.validations.
        if (this.__nextSuper) return this._super(key);
    },

    setUnknownProperty: function(key, value) {
        var res = /^(.+)IsValid$/.exec(key);
        var validations = this.get('validations');
        if (res && validations) {
            var propertyName = res[1];
            if (validations[propertyName]) {
                this._createIsValidProperties();
                return this.set(key, value);
            }
        }
        // Standard bailout, either the property wasn't of the form fooIsValid or we don't have property foo in
        // this.validations.
        if (this.__nextSuper) return this._super(key, value);

        Ember.defineProperty(this, key);
        return this.set(key, value);
    }
});

})();
(function() {
'use strict';

Flame.Validator.association = Flame.Validator.create({
    validate: function(target, key, forceRevalidation) {
        if (forceRevalidation === undefined) {
            forceRevalidation = false;
        }
        var association = target.get(key);
        if (Ember.isArray(association)) {
            return association.every(function(assoc) { return forceRevalidation ? assoc._checkValidity(true) : assoc.get('isValid'); });
        } else if (association) {
            return forceRevalidation ? association._checkValidity(true) : association.get('isValid');
        } else {
            return true;
        }
    }
});

})();
(function() {
'use strict';

var pattern = /^(([A-Za-z0-9]+_+)|([A-Za-z0-9]+\-+)|([A-Za-z0-9]+\.+)|([A-Za-z0-9]+\++))*[A-Za-z0-9\-]+@((\w+\-+)|(\w+\.))*\w{1,63}\.[a-zA-Z]{2,6}$/i;

Flame.Validator.email = Flame.Validator.create({
    validate: function(target, key) {
        return pattern.test(target.get(key));
    }
});

})();
(function() {
'use strict';

Flame.Validator.notBlank = Flame.Validator.create({
    validate: function(target, key) {
        return !Ember.isBlank(target.get(key));
    }
});

})();
(function() {
'use strict';

Flame.Validator.number = Flame.Validator.create({
    validate: function(target, key) {
        var value = target.get(key);
        return (value === '') || !(isNaN(value) || isNaN(parseFloat(value)));
    }
});

})();
(function() {
'use strict';

Flame.VERSION = '0.2.1-535-g2af37d9';

})();
