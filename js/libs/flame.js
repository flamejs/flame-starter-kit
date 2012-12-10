










window.Flame = Ember.Namespace.create({});
// In IE7, Range is not defined, which Metamorph handles with a fallback
if (typeof Range !== "undefined") {
  // In IE9, Range is defined but createContextualFragment is not, which Metamorph doesn't handle
  // From http://stackoverflow.com/questions/5375616/extjs4-ie9-object-doesnt-support-property-or-method-createcontextualfragme
  if (typeof Range.prototype.createContextualFragment === "undefined") {
      Range.prototype.createContextualFragment = function(html) {
          var doc = this.startContainer.ownerDocument;
          var container = doc.createElement("div");
          container.innerHTML = html;
          var frag = doc.createDocumentFragment(), n;
          while ( (n = container.firstChild) ) {
              frag.appendChild(n);
          }
          return frag;
      };
  }
}
;
/**
 * Copyright 2010 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Hashtable=(function(){var p="function";var n=(typeof Array.prototype.splice==p)?function(s,r){s.splice(r,1)}:function(u,t){var s,v,r;if(t===u.length-1){u.length=t}else{s=u.slice(t+1);u.length=t;for(v=0,r=s.length;v<r;++v){u[t+v]=s[v]}}};function a(t){var r;if(typeof t=="string"){return t}else{if(typeof t.hashCode==p){r=t.hashCode();return(typeof r=="string")?r:a(r)}else{if(typeof t.toString==p){return t.toString()}else{try{return String(t)}catch(s){return Object.prototype.toString.call(t)}}}}}function g(r,s){return r.equals(s)}function e(r,s){return(typeof s.equals==p)?s.equals(r):(r===s)}function c(r){return function(s){if(s===null){throw new Error("null is not a valid "+r)}else{if(typeof s=="undefined"){throw new Error(r+" must not be undefined")}}}}var q=c("key"),l=c("value");function d(u,s,t,r){this[0]=u;this.entries=[];this.addEntry(s,t);if(r!==null){this.getEqualityFunction=function(){return r}}}var h=0,j=1,f=2;function o(r){return function(t){var s=this.entries.length,v,u=this.getEqualityFunction(t);while(s--){v=this.entries[s];if(u(t,v[0])){switch(r){case h:return true;case j:return v;case f:return[s,v[1]]}}}return false}}function k(r){return function(u){var v=u.length;for(var t=0,s=this.entries.length;t<s;++t){u[v+t]=this.entries[t][r]}}}d.prototype={getEqualityFunction:function(r){return(typeof r.equals==p)?g:e},getEntryForKey:o(j),getEntryAndIndexForKey:o(f),removeEntryForKey:function(s){var r=this.getEntryAndIndexForKey(s);if(r){n(this.entries,r[0]);return r[1]}return null},addEntry:function(r,s){this.entries[this.entries.length]=[r,s]},keys:k(0),values:k(1),getEntries:function(s){var u=s.length;for(var t=0,r=this.entries.length;t<r;++t){s[u+t]=this.entries[t].slice(0)}},containsKey:o(h),containsValue:function(s){var r=this.entries.length;while(r--){if(s===this.entries[r][1]){return true}}return false}};function m(s,t){var r=s.length,u;while(r--){u=s[r];if(t===u[0]){return r}}return null}function i(r,s){var t=r[s];return(t&&(t instanceof d))?t:null}function b(t,r){var w=this;var v=[];var u={};var x=(typeof t==p)?t:a;var s=(typeof r==p)?r:null;this.put=function(B,C){q(B);l(C);var D=x(B),E,A,z=null;E=i(u,D);if(E){A=E.getEntryForKey(B);if(A){z=A[1];A[1]=C}else{E.addEntry(B,C)}}else{E=new d(D,B,C,s);v[v.length]=E;u[D]=E}return z};this.get=function(A){q(A);var B=x(A);var C=i(u,B);if(C){var z=C.getEntryForKey(A);if(z){return z[1]}}return null};this.containsKey=function(A){q(A);var z=x(A);var B=i(u,z);return B?B.containsKey(A):false};this.containsValue=function(A){l(A);var z=v.length;while(z--){if(v[z].containsValue(A)){return true}}return false};this.clear=function(){v.length=0;u={}};this.isEmpty=function(){return !v.length};var y=function(z){return function(){var A=[],B=v.length;while(B--){v[B][z](A)}return A}};this.keys=y("keys");this.values=y("values");this.entries=y("getEntries");this.remove=function(B){q(B);var C=x(B),z,A=null;var D=i(u,C);if(D){A=D.removeEntryForKey(B);if(A!==null){if(!D.entries.length){z=m(v,C);n(v,z);delete u[C]}}}return A};this.size=function(){var A=0,z=v.length;while(z--){A+=v[z].entries.length}return A};this.each=function(C){var z=w.entries(),A=z.length,B;while(A--){B=z[A];C(B[0],B[1])}};this.putAll=function(H,C){var B=H.entries();var E,F,D,z,A=B.length;var G=(typeof C==p);while(A--){E=B[A];F=E[0];D=E[1];if(G&&(z=w.get(F))){D=C(F,z,D)}w.put(F,D)}};this.clone=function(){var z=new b(t,r);z.putAll(w);return z}}return b})();
Ember.mixin(Array.prototype, {
    sum: function() {
        return this.reduce(function(sum, x) { return sum+x; }, 0);
    },

    isEqual: function(ary) {
        if (!ary) return false ;
        if (ary == this) return true;

        var loc = ary.get('length') ;
        if (loc != this.get('length')) return false ;

        while(--loc >= 0) {
            if (!Ember.isEqual(ary.objectAt(loc), this.objectAt(loc))) return false ;
        }
        return true ;
    },

    max: function() {
        return Math.max.apply(Math, this);
    },

    min: function() {
        return Math.min.apply(Math, this);
    },

    flatten: function() {
        return this.reduce(function(a, b) { return a.concat(b); }, []);
    }
});
// Cannot do reopen on Ember.Binding
Ember.mixin(Ember.Binding.prototype, {
    eq: function(testValue) {
        return this.transform(function(value, binding) {
            return ((Ember.typeOf(value) === 'string') && (value === testValue));
        });
    },

    // If value evaluates to true, return trueValue, otherwise falseValue
    transformTrueFalse: function(trueValue, falseValue) {
        return this.transform({
            to: function(value) {
                return value ? trueValue : falseValue;
            },
            from: function(value) {
                return value === trueValue;
            }
        });
    },

    //only return binding if target
    kindOf: function(klasses) {
        return this.transform(function(value, binding) {
            var object = (Ember.isArray(value) ? value.toArray()[0] : value);
            var klassArray = Ember.isArray(klasses) ? klasses : [klasses];
            var isKindOf = klassArray.some(function(k) {
                return object && object instanceof k;
            });
            if (isKindOf) {
                return object;
            } else {
                return null;
            }
        });
    },

    //returns true if obj equals binding value
    equals: function(obj) {
        return this.transform(function(value, binding) {
            return obj === value;
        });
    },

    isNull: function() {
        return this.transform(function(value, binding) {
            return value === null;
        });
    },

    hasPermission: function(key) {
        return this.transform(function(value, binding) {
            return (value && value.hasPermission && value.hasPermission(key));
        });
    }
});
Flame.computed = {
    equals: function(dependentKey, value) {
        return Ember.computed(dependentKey, function() {
            return value === Ember.getPath(this, dependentKey);
        }).cacheable();
    },

    notEquals: function(dependentKey, value) {
        return Ember.computed(dependentKey, function() {
            return value !== Ember.getPath(this, dependentKey);
        }).cacheable();
    },

    trueFalse: function(dependentKey, trueValue, falseValue) {
        return Ember.computed(dependentKey, function() {
            return Ember.getPath(this, dependentKey) ? trueValue : falseValue;
        }).cacheable();
    }
};

// XXX these are already in Ember master, include them here in case an older
// Ember version is used
Flame.computed.not = function(dependentKey) {
    return Ember.computed(dependentKey, function(key) {
        return !Ember.getPath(this, dependentKey);
    }).cacheable();
};

Flame.computed.empty = function(dependentKey) {
    return Ember.computed(dependentKey, function(key) {
        var val = Ember.getPath(this, dependentKey);
        return val === undefined || val === null || val === '' || (Ember.isArray(val) && Ember.get(val, 'length') === 0);
    }).cacheable();
};

Flame.computed.bool = function(dependentKey) {
    return Ember.computed(dependentKey, function(key) {
        return !!Ember.getPath(this, dependentKey);
    }).cacheable();
};

Flame.computed.or = function(dependentKey, otherKey) {
    return Ember.computed(dependentKey, otherKey, function(key) {
        return Ember.getPath(this, dependentKey) || Ember.getPath(this, otherKey);
    }).cacheable();
};
/*
 Converts height, width, left, right,top, bottom, centerX and centerY
 to a layout hash used in Flame.View
*/

function handleLayoutHash(hash) {
    var layout = null;
    if (hash.width > 0 || hash.height > 0 || hash.top > 0 || hash.bottom > 0 || hash.left > 0 || hash.right > 0 || hash.centerX !== null || hash.centerY !== null) {
        layout = { width: hash.width, height: hash.height, bottom: hash.bottom, top: hash.top, left: hash.left, right: hash.right, centerX: hash.centerX, centerY: hash.centerY };
    }
    return layout;
}

/*
 Usage:
   {{flameView Flame.ButtonView top=10 bottom=20 title="Save"}}
*/
Ember.Handlebars.registerHelper('flameView', function(path, options) {
    Ember.assert("The view helper only takes a single argument", arguments.length <= 2);
    // If no path is provided, treat path param as options.
    if (path && path.data && path.data.isRenderData) {
        options = path;
        path = "Flame.View";
    }
    var hash = options.hash;

    hash.layout = handleLayoutHash(hash);

    Ember.Handlebars.ViewHelper.helper(this, path, options);
});

/*
  Usage:
   {{#tabView height="300" width="300"}}
      {{#tab title="One" value="one"}}
        Content tab One
      {{/tab}}
      {{#tab title="Two" value="two"}}
        Content tab Two
      {{/tab}}
    {{/tabView}}
*/
Ember.Handlebars.registerHelper("tabView", function(path) {
    var options = path;
    var hash = options.hash;

    hash.layout = handleLayoutHash(hash);

    var tab_view = Flame.TabView.create(hash);

    var template = path.fn;

    if (template) {
        var context = tab_view.get('templateContext'),
            data = { buffer: [], view: tab_view };

        template(context, { data: data });
    }

    path.data.view.appendChild(tab_view);
});

Ember.Handlebars.registerHelper('tab', function(path) {
    var tabView = path.data.view;
    var hash = path.hash;
    var tab = hash;
    var options = path;

    tabView.set(hash.value, Flame.View.extend({
        template: options.fn
    }));


    if (tabView.get('tabs') === null) {
        tabView.set('tabs', Ember.A([]));
    }

    tabView.get('tabs').pushObject (hash);
});

/*
  Usage:
   {{#panelView height="200" width="300" title="Nice" allowMoving="true" centerX=0 centerY=-50 isModal=true allowClosingByClickingOutside=true}}
        content
   {{/panelView}}
*/
Ember.Handlebars.registerHelper("panelView", function(path){
    var options = path;
    var hash = options.hash;

    hash.layout = handleLayoutHash(hash);

    var template = path.fn;
    if (template) {
        hash.contentView = Flame.View.create({layout: { top: 26, bottom: 0, left: 0, right: 0}, "template" : template});
    }

    var view = Flame.Panel.create(hash);

    view.appendTo('body');
});

/*
  Usage:
    {{#table height="200" width="300" headerProperty="firstName" contentBinding="App.tableArray.content" controller="Flame.ArrayTableController"}}
      {{column label="First Name" property="firstName"}}
      {{column label="Second" property="lastName"}}
    {{/table}}
*/
Ember.Handlebars.registerHelper("tableView", function(path){
    var options = path;
    var hash = options.hash;

    hash.layout = handleLayoutHash(hash);

    var template = path.fn;

    if (template) {
        var data = { buffer: [], columns: Ember.A() };

        template(null, { data: data });
        hash.columns = data.columns;
    }

    hash.content = Ember.getPath(hash.controller).create({
        headerProperty: hash.headerProperty,
        columns: hash.columns,
        contentBinding: hash.contentBinding
    });

    var view = Flame.TableView.create({
        content: hash.content,
        layout: hash.layout
    });

    path.data.view.appendChild(view);
});

Ember.Handlebars.registerHelper('column', function(path) {
    var columns = path.data.columns;
    var hash = path.hash;
    var options = path;

    columns.pushObject(hash);
});

// IE < 10 doesn't support -ms-user-select CSS property, so we need to use onselectstart event to stop the selection
if (Ember.$.browser.msie && Ember.$.browser.version < 10) {
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
Flame.imagePath = 'images/';


Ember.mixin(Flame, {
    image: function(imageUrl) {
      if (typeof FlameImageUrlPrefix === 'undefined') {
          return (Flame.imagePath || '') + imageUrl;
      } else {
          return FlameImageUrlPrefix + imageUrl;
      }
    }
});

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

jQuery.fn.replaceClasses = function(newClasses) {
    this.removeAttr('class');
    if (newClasses) {
        this.attr('class', newClasses);
    }
    return this;
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
            if (attribute && attribute.name.match(/^data-(bindattr|ember)/)) {
                $this.removeAttr(attr.name);
            }
        }
    });

    // Remove ember ids
    clone.find('[id^=ember]').removeAttr('id');

    return clone;
};
/*
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



Ember.mixin(Ember.Binding.prototype, {
    connect: function(obj) {
        var m = this._from.match(/^(\^|\$)/);
        if (!m) {  // If not a prefixed binding, connect normally
            return this._super(obj);
        }
    }
});

Flame.reopen({
    // Bind our custom prefixed bindings. This method has to be explicitly called after creating a new child view.
    _bindPrefixedBindings: function(view) {
        for (var key in view) {
            if (key.match(/Binding$/)) {
                var binding = view[key];
                if (!(binding instanceof Ember.Binding)) {
                    throw 'Expected a Ember.Binding!';
                }

                var m = binding._from.match(/^(\^|\$)([^.]+)(.*)$/);
                if (m) {
                    var useValue = m[1] === '$';
                    var property = m[2];
                    var suffix = m[3];
                    var prefix;

                    if (useValue) {
                        prefix = this._lookupValueOfProperty(view, property);
                    } else {
                        prefix = this._lookupPathToProperty(view, property);
                    }
                    Ember.assert("Property '%@' was not found!".fmt(property), !Ember.none(prefix));

                    var finalPath = prefix + suffix;
                    var newBinding = new Ember.Binding(binding._to, finalPath);
                    newBinding._transforms = binding._transforms;  // Steal possible transforms
                    newBinding.connect(view);
                }
            }
        }
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

        while (!Ember.none(cur)) {
            // It seems that earlier (at least 0.9.4) the constructor of the view contained pleothra of properties,
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
(function() {
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
}());

/*
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

  Note that we don't keep the indexes stricly sequential, we only care about their relative order
  (in other words, there may be gaps after removal). This is to prevent unnecessary datastore
  updates.

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
    }.property(),

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
            content.forEach(function(item, i) {
                Ember.setPath(item, sortKey, i);
            });
        });
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
        return '__observer_'+Ember.guidFor(this);
    }.property().cacheable(),

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
                    self._removeSortIndexObserverFor(removedItem);
                }
            }
        });
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
        var self = this;
        this._withObserversSuppressed(function() {
            for (var i = start; i < start + removeCount; i++) {
                var removedItem = content.objectAt(i);
                source.removeObject(removedItem);
                self._removeSortIndexObserverFor(removedItem);
            }
        });
    },

    _contentArrayDidChange: function(content, start, removeCount, addCount) {
    // var time = new Date().getTime();
        if (addCount > 0) {
            var sortKey = this.get('sortKey');
            var source = this.get('source');
            var self = this;
            this._withObserversSuppressed(function() {
                content.forEach(function(item, i) {
                    Ember.setPath(item, sortKey, i);
                });

                for (var i = start; i < start + addCount; i++) {
                    var addedItem = content.objectAt(i);
                    self._addSortIndexObserverAndRegisterForRemoval(addedItem);
                    source.pushObject(addedItem);
                }
            });
        }
    },

    // TODO might be useful to make the replacing more fine-grained?
    _sortAndReplaceContent: function(newContent) {
        var content = this.get('content');
        Ember.assert('Must pass a copy of content, sorting the real content directly bypasses array observers!', content !== newContent);

        this._sort(newContent);
        this._withObserversSuppressed(function() {
            content.replace(0, content.get('length'), newContent);
        });
    },

    _sort: function(array) {
        var sortKey = this.get('sortKey');
        array.sort(function(o1, o2) {
            return Ember.compare(Ember.getPath(o1, sortKey), Ember.getPath(o2, sortKey));
        });
    },

    _withObserversSuppressed: function(func) {
        if (this._suppressObservers) return;  // If already suppressed, abort

        this._suppressObservers = true;
        try {
            func.call();
        } finally {
            this._suppressObservers = false;
        }
    }

});
if (String.prototype.trim === undefined) {
    String.prototype.trim = function() {
        return jQuery.trim(this);
    };
}

Ember.mixin(String.prototype, {
    truncate: function(maxLength) {
        var length = Ember.none(maxLength) ? 30 : maxLength;
        if (this.length <= length) {
            return this.toString();
        } else {
            return this.substr(0, length) + '...';
        }
    },

    isBlank: function() {
        return this.trim().length === 0;
    }
});
Ember.mixin(Flame, {
    _setupStringMeasurement: function(parentClasses, elementClasses) {
        if (!parentClasses) {
            parentClasses = '';
        }
        if (!elementClasses) {
            elementClasses = '';
        }
        var element = this._metricsCalculationElement;
        if (!element) {
            var parentElement = document.createElement("div");
            parentElement.style.cssText = "position:absolute;left:-10010px; top:-10px; width:10000px; visibility:hidden;";
            element = this._metricsCalculationElement = document.createElement("div");
            element.style.cssText = "position:absolute; left: 0px; top: 0px; bottom: auto; right: auto; width: auto; height: auto;";
            parentElement.appendChild(element);
            document.body.insertBefore(parentElement, null);
        }
        element.parentNode.className = parentClasses;
        element.className = elementClasses;
        return element;
    },

    measureString: function(string, parentClasses, elementClasses) {
        var element = this._setupStringMeasurement(parentClasses, elementClasses);
        element.innerHTML = string;
        return {
            width: element.clientWidth,
            height: element.clientHeight
        };
    }
});
Flame.TableCell = function(opts) {
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
    throw 'Not implemented';
};

Flame.TableCell.prototype.validate = function(newValue) {
    return true;
};

Flame.TableCell.prototype.formatValueForBackend = function(value) {
    throw 'Not implemented';
};

Flame.TableCell.prototype.isEditable = function() {
    return false;
};

// Returns an array of CSS classes for this cell
Flame.TableCell.prototype.cssClasses = function() {
    return [];
};

Flame.TableCell.prototype.cssClassesString = function() {
    return "";
};
Flame.TableHeader = Ember.Object.extend({
    isClickable: false,

    headerLabel: function() {
        return this.get('label');
    }.property('label').cacheable(),

    createCell: function(data) {
        throw 'Not implemented';
    }
});
Flame.TableSortSupport = {
    sortAscendingCaption: 'Sort ascending...',
    sortDescendingCaption: 'Sort descending...',

    sortContent: function(sortDescriptor) {
        throw 'Not implemented!';
    },

    columnHeaderClicked: function(header, targetElement) {
        this._showSortMenu(header, this._sortMenuOptions(header), targetElement);
    },

    _showSortMenu: function(header, options, anchorView) {
        //set width based on longest item title
        var longestTitle = options.map(function(i) { return i.title.length; }).max();
        var menu = Flame.MenuView.create({
            items: options,
            layout: { width: longestTitle * 8 },
            target: this,
            action: 'sortContent',
            payloadBinding: 'value'
        });
        menu.popup(anchorView);
    },

    _sortMenuOptions: function(header) {
        return [
            {title: this.get('sortAscendingCaption'), value: {header: header, order: 'asc'}},
            {title: this.get('sortDescendingCaption'), value: {header: header, order: 'desc'}}
        ];
    }
};
Flame.TableViewContentAdapter = Ember.Object.extend({
    content: null,

    headers: function() {
        return this.getPath('content._headers');
    }.property('content._headers').cacheable(),

    columnLeafs: function() {
        return this.getPath('content.columnLeafs');
    }.property('content.columnLeafs').cacheable(),

    rowLeafs: function() {
        return this.getPath('content.rowLeafs');
    }.property('content.rowLeafs').cacheable(),

    columnHeaderRows: function() {
        var columnHeaderRows = [];
        var headers = this.get('headers');
        var columnHeaders = headers.columnHeaders;
        var columnHeadersLength = columnHeaders.length;
        var i;
        for (i = 0; i < columnHeadersLength; i++) {
            this._processHeader(columnHeaderRows, columnHeaders[i], 'columns', 0, false, i);
        }

        columnHeaderRows.maxDepth = this.get('columnLeafs').map(function (x) { return x.depth; }).max();
        for (i = 0; i < this.get('columnLeafs').length; i++) {
            var colLeaf = this.get('columnLeafs')[i];
            colLeaf.rowspan = columnHeaderRows.maxDepth - colLeaf.depth + 1;
        }

        return columnHeaderRows;
    }.property('headers').cacheable(),

    rowHeaderRows: function() {
        var rowHeaderRows = [[]];
        var headers = this.get('headers');
        var rowHeaders = headers.rowHeaders;
        var rowHeadersLength = rowHeaders.length;
        var i;
        for (i = 0; i < rowHeadersLength; i++) {
            this._processHeader(rowHeaderRows, rowHeaders[i], 'rows', 0, i === 0, i);
        }

        rowHeaderRows.maxDepth = this.get('rowLeafs').map(function (x) { return x.depth; }).max();
        for (i = 0; i < this.get('rowLeafs').length; i++) {
            var rowLeaf = this.get('rowLeafs')[i];
            rowLeaf.colspan = rowHeaderRows.maxDepth - rowLeaf.depth + 1;
        }

        return rowHeaderRows;
    }.property('headers').cacheable(),

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
            headerRows[headerRows.length-1].push(header);
        }

        var count = 0;
        if (header.hasOwnProperty('children')) {
            var children = header.children;
            var length = children.length;
            for (var i = 0; i < length; i++) {
                var child = children[i];
                count += this._processHeader(headerRows, child, type, depth + 1, i === 0, index);
            }
        } else { count = 1; }

        if (type === 'columns') {
            header.colspan = count;
        } else {
            header.rowspan = count;
        }

        return count;
    }
});
/*jshint loopfunc: true */


Flame.State = Ember.Object.extend({
    gotoState: function(stateName) {
        this.get('owner').gotoState(stateName);
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

    $: function(args) {
        args = Array.prototype.slice.call(arguments);
        var owner = this.get('owner');
        return owner.$.apply(owner, args);
    }
});

Flame.State.reopenClass({
    gotoHandler: function(stateName, returnValue) {
        return function() {
            this.gotoState(stateName);
            return returnValue === undefined ? true : returnValue;
        };
    }
});

Flame.Statechart = {
    initialState: null,
    currentState: undefined,
    _currentStateName: undefined,

    init: function() {
        this._super();

        // Look for defined states and initialize them
        var key;
        for (key in this) {
            var state = this[key];
            if (Flame.State.detect(state)) {
                this.set(key, state.create({owner: this}));
                this._setupProxyMethods(this[key]);
            }
        }
        Ember.assert("No initial state defined for statechart!", !Ember.none(this.get('initialState')));
        this.gotoState(this.get('initialState'));
    },

    /**
      Sets up proxy methods so that methods called on the owner of the statechart
      will be invoked on the current state if they are not present on the owner of
      the statechart.
    */
    _setupProxyMethods: function(state) {
        for (var property in state) {
            if (state.constructor.prototype.hasOwnProperty(property) && Ember.typeOf(state[property]) === "function" &&
                !this[property] && property !== "enterState" && property !== "exitState") {
                this[property] = function(methodName) {
                    return function(args) {
                        args = Array.prototype.slice.call(arguments);
                        args.unshift(methodName);
                        return this.invokeStateMethod.apply(this, args);
                    };
                }(property);
            }
        }
    },

    gotoState: function(stateName) {
        Ember.assert("Cannot go to an undefined or null state!", !Ember.none(stateName));
        var currentState = this.get('currentState');
        var newState = this.get(stateName);
        //do nothing if we are already in the state to go to
        if (currentState === newState) {
            return;
        }
        if (!Ember.none(newState) && newState instanceof Flame.State) {
            if (!Ember.none(currentState)) {
                if (currentState.exitState) currentState.exitState();
            }
            this._currentStateName = stateName;
            this.set('currentState', newState);
            if (newState.enterState) newState.enterState();
        } else {
            throw new Error("%@ is not a state!".fmt(stateName));
        }
    },

    /**
     * Is this state chart currently in a state with the given name?
     * @param stateName
     * @returns {Boolean} is this statechart currently in a state with the given name?
     */
    isCurrentlyIn: function(stateName) {
        return this._currentStateName === stateName;
    },

    invokeStateMethod: function(methodName, args) {
        args = Array.prototype.slice.call(arguments); args.shift();
        var state = this.get('currentState');
        Ember.assert("Cannot invoke state method without having a current state!", !Ember.none(state) && state instanceof Flame.State);
        var method = state[methodName];
        if (Ember.typeOf(method) === "function") {
            return method.apply(state, args);
        }
    }
};
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
                throw "Can't push data without first setting headers!";
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
    _dataBatchIsForCurrentTable : function(dataBatch) {
        var length = dataBatch.length;
        var mapping = this.get("_indexFromPathMapping");
        return length > 0 ? mapping[dataBatch[0].path.row] && mapping[dataBatch[length-1].path.row] : false;
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
    }.property("rowLeafs", "columnLeafs").cacheable(),

    rowLeafs: function() {
        var headers = this.get('_headers');
        if (!headers) { return null; }
        return this._getLeafs(headers.rowHeaders, []);
    }.property('_headers').cacheable(),

    columnLeafs: function() {
        var headers = this.get('_headers');
        if (!headers) { return null; }
        return this._getLeafs(headers.columnHeaders, []);
    }.property('_headers').cacheable(),

    pathFromIndex: function(index) {
        var rowLeafs = this.get('rowLeafs');
        var columnLeafs = this.get('columnLeafs');
        return {row: rowLeafs[index[0]].path, column: columnLeafs[index[1]].path};
    },

    // Translate a path to an index in the 2-dimensional grid of data
    // see path documentation in table_data.rb for more information
    indexFromPath: function(path) {
        var mapping = this.get("_indexFromPathMapping");
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
        if (!Ember.none(headers)) {
            var data = [];
            this.set('dirtyCells', []);

            // fill this.data with nulls, will be fetched lazily later
            var rowLength = this.get('rowLeafs').length;
            var columnLength = this.get('columnLeafs').length;
            for (i = 0; i < rowLength; i++) {
                data.push([]);
                for (var j = 0; j < columnLength; j++) {
                    data[i].push(null);
                }
            }
            this.set('_data', data);
        }
    }.observes('_headers')
});


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
    }.property('headers').cacheable(),

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
    }.property().cacheable(),

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
        Ember.assert('headerProperty not defined for ArrayTableAdapter!', !!headerProperty);
        var rowHeadersClickable = this.get('rowHeadersClickable');
        var self = this;
        return {
            rowHeaders: this.get('content').map(function(object, i) {
                // headers won't update in-place, have to force rerender via observer
                var originalValue = object.get(headerProperty);
                var observerMethod = function() {
                    return function(sender, key, value) {
                        // relies on ArrayTableController#headers being recreated when headers change
                        if (value !== originalValue) {
                            self.refreshHeaders();
                        }
                    };
                }();
                self._setPropertyObserver(object, headerProperty, observerMethod);
                return {
                    isClickable: rowHeadersClickable,
                    label: object.get(headerProperty),
                    object: object
                };
            }),
            columnHeaders: this.get('columns').map(function(column, i) {
                return {label: Ember.getPath(column, 'label'), property: Ember.getPath(column, 'property')};
            })
        };
    }.property('content.@each', 'columns', 'headerProperty', 'rowHeadersClickable').cacheable(),

    data: function() {
        var self = this;
        var columns = this.get('columns');
        return this.get('content').map(function(object, i) {
            return columns.map(function(column, j) {
                // add observer for in-place cell refreshing
                var propertyName = Ember.getPath(column, 'property');
                var observerMethod = function() {
                    return function(sender, key, value) {
                        self.pushDataBatch([{path: {row: [i], column: [j]}, value: value}]);
                    };
                }();
                self._setPropertyObserver(object, propertyName, observerMethod);

                return Ember.get(object, Ember.getPath(column, 'property'));
            });
        });
    }.property('headers').cacheable(),

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
// Support for firing an action, given a target, action and an optional payload. Any of those
// can naturally be defined with a binding. Furthermore, if target is a path the resolves to
// a string, that string is again resolved as a path, etc. until it resolved on non-string.
// For example, target could be 'parentView.controller', which could resolve to
// 'MyApp.fooController', which would then resolve to a controller object. If target is not
// defined, it defaults to the view itself.
//
// Action can be defined as a string or a function. If it's a function, it's called with the
// target bound to 'this'.
//
// If payload is not defined, it defaults to the view itself.
Flame.ActionSupport = {
    target: null,
    action: null,
    payload: null,

    fireAction: function(action, payload) {
        var target = this.get('target') || this;

        while ('string' === typeof target) {  // Use a while loop: the target can be a path gives another path
            if (target.charAt(0) === '.') {
                target = this.getPath(target.slice(1));  // If starts with a dot, interpret relative to this view
            } else {
                target = Ember.getPath(target);
            }
        }
        if (action === undefined) { action = this.get('action'); }

        if (action) {
            var actionFunction = 'function' === typeof action ? action : Ember.get(target, action);
            if (!actionFunction) throw 'Target %@ does not have action %@'.fmt(target, action);
            var actualPayload = !Ember.none(payload) ? payload : this.get('payload');
            if (Ember.none(actualPayload)) { actualPayload = this; }
            return actionFunction.call(target, actualPayload, action, this);
        }

        return false;
    }
};
(function() {
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
                case "keydown": emberEvent = 'keyDown'; break;
                case "keypress": emberEvent = 'keyPress'; break;
            }
            var handler = emberEvent ? this.get(emberEvent) : null;
            if (window.FlameInspector && emberEvent) FlameInspector.logEvent(event, emberEvent, this);
            if (handler) {
                // Note that in jQuery, the contract is that event handler should return
                // true to allow default handling, false to prevent it. But in Ember, event handlers return true if they handled the event,
                // false if they didn't, so we want to invert that return value here.
                return !handler.call(Flame.keyResponderStack.current(), event, Flame.keyResponderStack.current());
            } else if (emberEvent === "keyDown" && this.interpretKeyEvents(event)) { // Try to hand down the event to a more specific key event handler
                return false;
            } else if (this.get('parentView')) {
                return this.get('parentView').handleKeyEvent(event, view);
            }
        }
    };

    Ember.View.reopen(eventHandlers);
    Ember.TextSupport.reopen(eventHandlers);
}());

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
    keyResponderStack: Ember.Object.create({
        _stack: [],

        // Observer-friendly version of getting current
        currentKeyResponder: function() {
            return this.current();
        }.property(),

        current: function() {
            var length = this._stack.get('length');
            if (length > 0) return this._stack.objectAt(length - 1);
            else return undefined;
        },

        push: function(view) {
            if (!Ember.none(view)) {
                if (view.willBecomeKeyResponder) view.willBecomeKeyResponder();
                //console.log('View %s became key responder', Ember.guidFor(view));
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
                //console.log('View %s will lose key responder', Ember.guidFor(view));
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

// This logic is needed so that the view that handled mouseDown will receive mouseMoves and the eventual mouseUp, even if the
// pointer no longer is on top of that view. Without this, you get inconsistencies with buttons and all controls that handle
// mouse click events. The ember event dispatcher always first looks up 'eventManager' property on the view that's
// receiving an event, and lets that handle the event, if defined. So this should be mixed in to all the Flame views.
Flame.EventManager = {
    // Set to true in your view if you want to accept key responder status (which is needed for handling key events)
    acceptsKeyResponder: false,

    /*
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

    /*
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
            if (Flame.get('mouseResponderView') !== undefined) {
                view = Flame.get('mouseResponderView');
                Flame.set('mouseResponderView', undefined);
            }
            return !this._dispatch('mouseUp', event, view);
        },

        mouseMove: function(event, view) {
            if (Flame.get('mouseResponderView') !== undefined) {
                view = Flame.get('mouseResponderView');
            }
            return !this._dispatch('mouseMove', event, view);
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
            if (window.FlameInspector) FlameInspector.logEvent(event, eventName, view);
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
Flame.FocusSupport = {
    // To make text fields/areas behave consistently with our concept of key responder, we have to also
    // tell the browser to focus/blur the input field
    didBecomeKeyResponder: function() {
        this.$().focus();
    },

    didLoseKeyResponder: function() {
        this.$().blur();
    },

    focusIn: function() {
        if (Flame.keyResponderStack.current() !== this) {
            this.becomeKeyResponder();
        }
    },

    focusOut: function() {
        if (Flame.keyResponderStack.current() === this) {
            this.resignKeyResponder();
        }
    }
};


// Mix this into any view. Calling enterFullscreen then makes the view shown fullscreen. An 'exit fullscreen' button is
// shown automatically on the right upper corner on top of everything.
//
// TODO Make this work on IE7. The problem is that the modal pane covers everything, only the close button appears on top.
Flame.FullscreenSupport = {
    isFullscreen: false,

    _oldAttributes: undefined,
    _pane: undefined,
    _button: undefined,

    modalPane: function() {
        return Flame.View.create({
            layout: { left: 0, top: 0, right: 0, bottom: 0 },
            classNames: ['flame-fullscreen-pane'],
            owner: undefined
        });
    }.property(),

    closeButton: function() {
        return Flame.ButtonView.create({
            layout: { right: 3, top: 3, width: 24, height: 24 },
            classNames: ['flame-fullscreen-close'],
            // XXX image support in ButtonView?
            handlebars: "<img style='margin: 3px;' src='%@'>".fmt(Flame.image('fullscreen_off.png')),
            action: function() {
                this.getPath('owner').exitFullscreen();
            }
        });
    }.property(),

    // A statechart would perhaps make sense here, but as FullscreenSupport is meant to be mixed in to any view
    // you want full-screenable, that view might already be using a statechart for other purposes?
    enterFullscreen: function() {
        if (!this.get('isFullscreen')) {
            // The close button cannot be a child of the pane, because then it's not shown in front of the fullscreen stuff.
            // This is apparently because the pane establishes a stacking context, see http://www.w3.org/TR/CSS21/visuren.html#propdef-z-index
            var pane, closeButton;
            this.set('_pane', pane = this.get('modalPane'));
            this.set('_button', closeButton = this.get('closeButton'));
            pane.set('owner', this);
            closeButton.set('owner', this);
            pane.append();
            closeButton.append();

            var element = this.$();
            var oldAttributes = {
                left: element.css('left'), 
                top: element.css('top'),
                right: element.css('right'),
                bottom: element.css('bottom'),
                width: element.css('width'),
                height: element.css('height'),
                position: element.css('position'),
                zIndex: element.css('zIndex')
            };

            // If both left & right or top & bottom is defined, discard width/height to keep the layout fluid when exiting fullscreen
            if (oldAttributes.left !== 'auto' && oldAttributes.right !== 'auto') oldAttributes.width = undefined;
            if (oldAttributes.top !== 'auto' && oldAttributes.bottom !== 'auto') oldAttributes.height = undefined;
            this.set('_oldAttributes', oldAttributes);

            element.css({ left: 0, top: 0, right: 0, bottom: 0, width: '', height: '', position: 'fixed', zIndex: '50' });

            this.set('isFullscreen', true);
        }
    },

    exitFullscreen: function() {
        if (this.get('isFullscreen')) {
            this.$().css(this.get('_oldAttributes'));
            this.get('_pane').remove();
            this.get('_button').remove();

            this.set('isFullscreen', false);
        }
    }
};
// Support for defining the layout with a hash, e.g. layout: {left: 10, top: 10, width: 100, height: 30}
Flame.LayoutSupport = {
    useAbsolutePosition: true,
    concatenatedProperties: ['displayProperties'],
    layout: {left: 0, right: 0, top: 0, bottom: 0},
    defaultWidth: undefined,
    defaultHeight: undefined,
    layoutManager: undefined,
    rootView: false,

    _layoutProperties: ['left', 'right', 'top', 'bottom', 'width', 'height'],
    _cssProperties: ['left', 'right', 'top', 'bottom', 'width', 'height', 'margin-left', 'margin-top'],
    _layoutChangeInProgress: false,
    _layoutSupportInitialized: false,

    init: function() {
        this._super();
        this._initLayoutSupport();
        this.consultLayoutManager();
        this.updateLayout();  // Make sure CSS is up-to-date, otherwise can sometimes get out of sync for some reason
    },

    createChildView: function(view, attrs) {
        view = this._super(view, attrs);
        Flame._bindPrefixedBindings(view);
        return view;
    },

    // When using handlebars templates, the child views are created only upon rendering, not in init.
    // Thus we need to consult the layout manager also at this point.
    didInsertElement: function() {
        this._super();
        this.consultLayoutManager();
    },

    childViewsDidChange: function() {
        this._super.apply(this, arguments);
        this.consultLayoutManager();
    },

    _initLayoutSupport: function() {
        // Do this initialization even if element is not currently using absolute positioning, just in case
        var layout = Ember.Object.create(Ember.copy(this.get('layout')));  // Clone layout for each instance in case it's mutated (happens with split view)

        if (layout.width === undefined && layout.right === undefined && this.get('defaultWidth') !== undefined) {
            layout.width = this.get('defaultWidth');
        }
        if (layout.height === undefined && (layout.top === undefined || layout.bottom === undefined) && this.get('defaultHeight') !== undefined) {
            layout.height = this.get('defaultHeight');
        }

        this.set('layout', layout);

        // For changes to the layout it's enough to update the DOM
        this.addObserver('layout', this, this.updateLayout);

        this._layoutSupportInitialized = true;
    },

    _renderElementAttributes: function(buffer) {
        Ember.assert('Layout support has not yet been initialized!', !!this._layoutSupportInitialized);
        if (!this.get('useAbsolutePosition')) return;

        var layout = this.get('layout') || {};
        this._resolveLayoutBindings(layout);
        var cssLayout = this._translateLayout(layout);

        this._cssProperties.forEach(function(prop) {
            var value = cssLayout[prop];
            if (!Ember.none(value)) {
                buffer.style(prop, value);
            }
        });
        if (layout.zIndex !== undefined) buffer.style('z-index', layout.zIndex);

        var backgroundColor = this.get('backgroundColor');
        if (backgroundColor !== undefined) buffer.style('background-color', backgroundColor);

        buffer.addClass('flame-view');
    },

    render: function(buffer) {
        this._renderElementAttributes(buffer);
        return this._super(buffer);
    },

    _resolveLayoutBindings: function(layout) {
        if (layout._bindingsResolved) return;  // Only add the observers once, even if rerendered
        var self = this;
        this._layoutProperties.forEach(function(prop) {
            var value = layout[prop];
            // Does it look like a property path (and not e.g. '50%')?
            if (!Ember.none(value) && 'string' === typeof value && value !== '' && isNaN(parseInt(value, 10))) {
                // TODO remove the observer when view destroyed?
                self.addObserver(value, self, function() {
                    self.adjustLayout(prop, self.getPath(value));
                });
                layout[prop] = self.getPath(value);
            }
        });
        layout._bindingsResolved = true;
    },

    // Given a layout hash, translates possible centerX and centerY to appropriate CSS properties
    _translateLayout: function(layout) {
        var cssLayout = {};

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

        this._cssProperties.forEach(function(prop) {
            var value = cssLayout[prop];
            // If a number or a string containing only a number, append 'px'
            if (value !== undefined && ('number' === typeof value || parseInt(value, 10).toString() === value)) {
                cssLayout[prop] = value+'px';
            }
        });

        return cssLayout;
    },

    // If layout manager is defined, asks it to recompute the layout, i.e. update the positions of the child views
    consultLayoutManager: function() {
        // View initializations might result in calling this method before they've called our init method.
        // That causes very bad effects because the layout property has not yet been cloned, which means
        // that several views might be sharing the layout property. So just ignore the call if not initialized.
        if (!this._layoutSupportInitialized) return;

        // This if needed to prevent endless loop as the layout manager is likely to update the children, causing this method to be called again
        if (!this._layoutChangeInProgress) {
            this._layoutChangeInProgress = true;
            try {
                var layoutManager = this.get('layoutManager');
                if (layoutManager !== undefined) layoutManager.setupLayout(this);
            } finally {
                this._layoutChangeInProgress = false;
            }
        }
    },

    layoutDidChangeFor: function(childView) {
        this.consultLayoutManager();
    },

    // Can be used to adjust one property in the layout. Updates the DOM automatically.
    adjustLayout: function(property, value, increment) {
        Ember.assert('Layout support has not yet been initialized!', !!this._layoutSupportInitialized);

        var layout = this.get('layout');
        var oldValue = layout[property];
        var newValue;
        if (value !== undefined) {
            newValue = value;
        } else if (increment !== undefined) {
            newValue = oldValue + increment;
        } else throw 'Give either a new value or an increment!';

        if (oldValue !== newValue) {
            layout[property] = newValue;
            this.updateLayout();
        }
    },

    // Call this method to update the DOM to reflect the layout property, without recreating the DOM element
    updateLayout: function() {
        Ember.assert('Layout support has not yet been initialized!', !!this._layoutSupportInitialized);

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
    }.observes('isVisible'),

    // XXX: isVisible property doesn't seem to always get set properly, so make sure it is true
    isVisible: true,

    _isVisibleWillChange: function() {
        var callback;
        if (!this.get('isVisible')) {
            callback = 'willBecomeVisible';
        } else {
            callback = 'willBecomeHidden';
        }
        this.invokeRecursively(function(view) {
            if (view[callback]) view[callback].apply(view);
        });
    }.observesBefore('isVisible')
};




/*
  Layout managers are helpers that you can delegate setting the layout properties to when you get
  tired of doing it manually. They can also update the layout on the fly by reacting to changes
  in the layout of child views.
*/

Flame.LayoutManager = Ember.Object.extend({
    setupLayout: undefined
});
/*
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
        var self = this;
        var top = self.get('topMargin');
        var fluid = false, isFirst = true;

        // Filter out views that are not affected by the layout manager
        var views = view.get('childViews').filter(function(childView) {
            return childView.get('ignoreLayoutManager') !== true &&
                (childView.get('isVisible') || childView.get('isVisible') === null) && // isVisible is initially null
                childView.get('layout');
        });
        var len = views.get('length');

        views.forEach(function(childView, i) {
            if ('string' === typeof childView) throw 'Child views have not yet been initialized!';

            if (!isFirst) {  // Cannot check the index because some child views may be hidden and must be ignored
                top += self.get('spacing');
            } else {
                isFirst = false;
            }

            var layout = childView.get('layout');
            childView._resolveLayoutBindings(layout);  // XXX ugly
            Ember.assert('All child views must define layout when using VerticalStackLayoutManager!', !Ember.none(layout));

            top += (layout.topMargin || 0);
            childView.adjustLayout('top', top);  // Use adjustLayout, it checks if the property changes (can trigger a series of layout updates)
            top += (layout.topPadding || 0) + (layout.bottomPadding || 0);  // if view has borders, these can be used to compensate

            var height = layout.height;
            if ('string' === typeof height) height = parseInt(height, 10);
            if (i < len - 1) {  // XXX should not check the index, this check should only consider visible child views
                Ember.assert('All child views except last one must define layout.height when using VerticalStackLayoutManager!', !Ember.none(height));
            }

            if (Ember.none(layout.height)) {
                fluid = true;
            } else {
                top += height;
            }
        });

        // fluid == true means that the last child has no height set, meaning that it's meant to fill in the rest of the parent's view.
        // In that case, we must not set parent's height either, because the system is supposed to remain fluid (i.e. bottom is set).
        if (!fluid) {
            top += this.get('bottomMargin');
            view.adjustLayout('height', top);
        }
    }
});





Ember.View.reopen({
    // Finds the first descendant view for which given property evaluates to true. Proceeds depth-first.
    firstDescendantWithProperty: function(property) {
        var result;
        this.forEachChildView(function(childView) {
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

    POSITION_BELOW: 1 << 0,
    POSITION_RIGHT: 1 << 1,
    POSITION_LEFT: 1 << 2,
    POSITION_ABOVE: 1 << 3,
    POSITION_MIDDLE: 1 << 4,

    FOCUS_RING_MARGIN: 3
});

// Base class for Flame views. Can be used to hold child views or render a template. In Ember, you normally either use
// Ember.View for rendering a template or Ember.ContainerView to render child views. But we want to support both here, so
// that we can use e.g. Flame.ListItemView for items in list views, and the app can decide whether to use a template or not.
Flame.View = Ember.ContainerView.extend(Flame.LayoutSupport, Flame.EventManager, {
    displayProperties: [],
    isFocused: false,  // Does this view currently have key focus?

    init: function() {
        this._super();

        // There's a 'gotcha' in Ember that we need to work around here: an Ember.View does not have child views in the sense
        // that you cannot define them yourself. But when used with a handlebars template, Ember.View uses child views
        // internally to keep track of dynamic portions in the template so that they can be updated in-place in the DOM.
        // The template rendering process adds this kind of child views on the fly. The problem is that we need to extend
        // Ember.ContainerView here (see above), and that observes the child views to trigger a re-render, which then happens
        // when we're already in the middle of a render, crashing with error 'assertion failed: You need to provide an
        // object and key to `get`' (happens because parent buffer in a render buffer is null).
        if (this.get('template')) {
            this.set('states', Ember.View.states);  // Use states from Ember.View to remedy the problem
        }

        // Add observers for displayProperties so that the view gets rerendered if any of them changes
        var properties = this.get('displayProperties') || [];
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            this.addObserver(property, this, this.rerender);
        }

    },

    render: function(buffer) {
        this._renderElementAttributes(buffer);
        // If a template is defined, render that, otherwise use ContainerView's rendering (render childViews)
        var template = this.get('template');
        if (template) {
            // Copied from Ember.View for now
            var output = template(this.get('templateContext'), { data: { view: this, buffer: buffer, isRenderData: true, keywords: {} } });
            if (output !== undefined) { buffer.push(output); }
        } else {
            return this._super(buffer);
        }
    },

    template: function(propertyName, value) {
        if (propertyName === "template" && value !== undefined) return value;
        var str = this.get('handlebars');
        return str ? this._compileTemplate(str) : null;
    }.property('templateName', 'handlebars').cacheable(),

    // Compiles given handlebars template, with caching to make it perform better. (Called repetitively e.g.
    // when rendering a list view whose item views use a template.)
    _compileTemplate: function(template) {
        var compiled = Flame._templateCache[template];
        if (!compiled) {
            //console.log('Compiling template: %s', template);
            Flame._templateCache[template] = compiled = Ember.Handlebars.compile(template);
        }
        return compiled;
    }
});

Flame._templateCache = {};
Flame.ImageView = Flame.View.extend({
    templateContext: function() {
        return { value: this.get('value') };
    }.property('value'),

    handlebars: '<img {{bindAttr src="value"}}>'
});

/* 
   Use this view at the top of the view hierarchy, either directly or as a superclass.
   The rootView property is needed for being able to set up the prefixed bindings, see
   Flame._bindPrefixedBindings for more info.
*/

Flame.RootView = Flame.View.extend({
    rootView: true
});
Flame.LabelView = Flame.View.extend(Flame.ActionSupport, {
    layout: { left: 0, top: 0 },
    classNames: ['flame-label-view'],
    classNameBindings: ['textAlign', 'isSelectable', 'isDisabled'],
    defaultHeight: 22,
    defaultWidth: 200,
    isSelectable: false,
    isDisabled: false,
    allowWrapping: false,

    handlebars: '{{value}}',

    render: function(buffer) {
        var height = this.getPath('layout.height');
        if (this.get('useAbsolutePosition') &&
            !Ember.none(height) &&
            !this.get('allowWrapping')) {
            buffer.style('line-height', height+'px');
        }
        this._super(buffer);
    },

    mouseDown: function(evt) {
        return this.fireAction();
    },

    // We should never let mouseUp propagate. If we handled mouseDown, we will receive mouseUp and obviously
    // it shouldn't be propagated. If we didn't handle mouseDown (there was no action), it was propagated up
    // and the mouse responder logic will relay mouseUp directly to the view that handler mouseDown.
    mouseUp: function(evt) {
        return true;
    },

    // Apply the same logic to touchStart and touchEnd
    touchStart: function(evt) {
        return this.fireAction();
    },
    touchEnd: function(evt) {
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
    },

    // Shortcut for creating label views using a binding
    binding: function(valueBinding, left, top, width, height) {
        return Flame.LabelView.extend({
            layout: { left: left, top: top, width: width, height: height },
            valueBinding: valueBinding
        });
    }
});



// When multiple panels with modal panes are shown at the same time, we need this to get them to stack on
// top of each other. If they use a static z-index, all the panels would appear on top of all the modal panes.
Flame._zIndexCounter = 100;

// A pop-up panel, modal or non-modal. The panel is destroyed on closing by default. If you intend to reuse the same
// panel instance, set destroyOnClose: false.
Flame.Panel = Flame.RootView.extend({
    classNames: ['flame-panel'],
    childViews: ['titleView', 'contentView', 'resizeView'],
    destroyOnClose: true,
    acceptsKeyResponder: true,
    isModal: true,
    allowClosingByClickingOutside: true,
    allowMoving: false,
    dimBackground: true,
    title: null,
    isShown: false,
    // make isResizable true to allow panel to be resized by the user
    isResizable: false,
    // Default minimum size for the resized panel
    minHeight: 52,
    minWidth: 100,

    _keyResponderOnPopup: undefined,

    init: function() {
        Ember.assert('Flame.Panel needs a contentView!', !!this.get('contentView'));
        this._super();
    },

    titleView: Flame.View.extend(Flame.Statechart, {
        layout: { left: 0, right: 0, height: 26, bottomPadding: 1 },
        classNames: ['flame-panel-title'],
        childViews: ['labelView'],
        isVisible: Flame.computed.notEquals('parentView.title', null),
        initialState: 'idle',

        labelView: Flame.LabelView.extend({
            layout: { left: 4, right: 4, top: 2 },
            textAlign: Flame.ALIGN_CENTER,
            valueBinding: 'parentView.parentView.title'
        }),

        idle: Flame.State.extend({
            mouseDown: function(event) {
                var owner = this.get('owner');
                if (!owner.getPath('parentView.allowMoving')) {
                    return true;
                }
                owner._pageX = event.pageX;
                owner._pageY = event.pageY;
                var offset = owner.get('parentView').$().offset();
                owner._panelX = offset.left;
                owner._panelY = offset.top;
                this.gotoState('moving');
                return true;
            },
            touchStart: function(event) {
                // Normalize the event and send it to mouseDown()
                this.mouseDown(this.normalizeTouchEvents(event));
                return true;
            }
        }),

        moving: Flame.State.extend({
            mouseMove: function(event) {
                var owner = this.get('owner');
                var newX = owner._panelX + (event.pageX - owner._pageX);
                var newY = owner._panelY + (event.pageY - owner._pageY);
                var element = owner.get('parentView').$();
                newX = Math.max(5, Math.min(newX, Ember.$(window).width() - element.outerWidth() - 5));  // Constrain inside window
                newY = Math.max(5, Math.min(newY, Ember.$(window).height() - element.outerHeight() - 5));
                element.css({left: newX, top: newY, right: '', bottom: '', marginLeft: '', marginTop: ''});
                return true;
            },
            touchMove: function(event) {
                // Don't scroll the page while doing this
                event.preventDefault();
                // Normalize the event and send it to mouseMove()
                this.mouseMove(this.normalizeTouchEvents(event));
                return true;
            },
            mouseUp: Flame.State.gotoHandler('idle'),
            touchEnd: Flame.State.gotoHandler('idle')
        })
    }),

    resizeView: Flame.View.extend(Flame.Statechart, {
        layout: { bottom: 3, right: 3, height: 16, width: 16 },
        ignoreLayoutManager: true,
        classNames: ['flame-resize-thumb'],
        isVisibleBinding: '^isResizable',
        initialState: 'idle',

        idle: Flame.State.extend({
            mouseDown: function(event) {
                var owner = this.get('owner');
                var panelElement = owner.get('parentView').$();
                if (!owner.getPath('parentView.isResizable')) {
                    return true;
                }
                owner._pageX = event.pageX;
                owner._pageY = event.pageY;
                owner._startW = panelElement.outerWidth();
                owner._startH = panelElement.outerHeight();
                this.gotoState('resizing');
                return true;
            },
            touchStart: function(event) {
                // Normalize the event and send it to mouseDown()
                this.mouseDown(this.normalizeTouchEvents(event));
                return true;
            }
        }),
        resizing: Flame.State.extend({
            mouseMove: function(event) {
                var owner = this.get('owner');
                var parentView = owner.get('parentView');
                var newW = owner._startW + (event.pageX - owner._pageX);
                var newH = owner._startH + (event.pageY - owner._pageY);
                newW = Math.max(parentView.get('minWidth'), newW);  // Minimum panel width
                newH = Math.max(parentView.get('minHeight'), newH);  // Minimum panel height: title bar plus this "thumb"
                parentView.$().css({width: newW, height: newH });
                return true;
            },
            touchMove: function(event) {
                // Don't scroll the page while resizing
                event.preventDefault();
                // Normalize the event and send it to mouseMove()
                this.mouseMove(this.normalizeTouchEvents(event));
                return true;
            },
            mouseUp: Flame.State.gotoHandler('idle'),
            touchEnd: Flame.State.gotoHandler('idle')
        })
    }),

    // This is the pane that's used to obscure the background if isModal === true
    modalPane: function() {
        return Flame.RootView.create({
            layout: { left: 0, top: 0, right: 0, bottom: 0 },
            classNames: ['flame-modal-pane'],
            classNameBindings: ['parentPanel.dimBackground'],

            parentPanel: null,
            mouseDown: function() {
                if (this.getPath('parentPanel.allowClosingByClickingOutside')) {
                    this.get('parentPanel').close();
                }
                return true;
            },
            touchStart: function() {
                if (this.getPath('parentPanel.allowClosingByClickingOutside')) {
                    this.get('parentPanel').close();
                }
                return true;
            }
        });
    }.property(),

    insertNewline: function(event) {
        var defaultButton = this.firstDescendantWithProperty('isDefault');
        if (defaultButton && defaultButton.simulateClick) {
            defaultButton.simulateClick();
        }
        return true;
    },

    _layoutRelativeTo: function(anchor, position) {
        position = position || Flame.POSITION_BELOW;

        var layout = this.get('layout');
        var anchorElement = anchor instanceof jQuery ? anchor : anchor.$();
        var offset = anchorElement.offset();

        var contentView = this.get('childViews')[0];
        if (contentView && contentView.get('layout') && contentView.get('layout').height && (!layout || !layout.height)) {
            layout.height = contentView.get('layout').height;
        }

        if (position & (Flame.POSITION_BELOW | Flame.POSITION_ABOVE)) {
            layout.top = offset.top + ((position & Flame.POSITION_BELOW) ? anchorElement.outerHeight() : -layout.height);
            layout.left = offset.left;
            if (position & Flame.POSITION_MIDDLE) {
                layout.left = layout.left - (layout.width / 2) + (anchorElement.outerWidth() / 2);
            }
        } else if (position & (Flame.POSITION_RIGHT | Flame.POSITION_LEFT)) {
            layout.top = offset.top;
            layout.left = offset.left + ((position & Flame.POSITION_RIGHT) ? anchorElement.outerWidth() : -layout.width);
            if (position & Flame.POSITION_MIDDLE) {
                layout.top = layout.top - (layout.height / 2) + (anchorElement.outerHeight() / 2);
            }
        } else {
            Ember.assert('Invalid position for panel', false);
        }

        // Make sure the panel is still within the viewport horizontally ...
        var _window = Ember.$(window);
        if (layout.left + layout.width > _window.width() - 10) {
            layout.left = _window.width() - layout.width - 10;
            layout.movedX = true;
        }
        // ... and vertically
        if ((position & Flame.POSITION_BELOW && (layout.top + layout.height > _window.height() - 10) && offset.top - layout.height >= 0) ||
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
                modalPane.append();
                this.set('_modalPane', modalPane);
            }

            if (anchor) {
                this.set("layout", this._layoutRelativeTo(anchor, position));
            }
            this.get('layout').zIndex = Flame._zIndexCounter + 10;
            Flame._zIndexCounter += 100;

            this.append();
            this.set('isShown', true);
            if (this.get('acceptsKeyResponder')) this.becomeKeyResponder(false);
            this._focusDefaultInput();
        }
    },

    close: function() {
        if (this.isDestroyed) { return; }
        if (this.get('isShown')) {
            if (this.get('isModal')) {
                this.get('_modalPane').remove();
                this.get('_modalPane').destroy();
            }
            this.remove();
            this.set('isShown', false);
            if (this.get('acceptsKeyResponder')) this.resignKeyResponder();
            Flame._zIndexCounter -= 100;

            if (this.get('destroyOnClose')) this.destroy();
        }
    },

    _focusDefaultInput: function() {
        // Let Ember render the element before we focus it
        Ember.run.next(this, function() {
            var defaultFocus = this.firstDescendantWithProperty('isDefaultFocus');
            if (defaultFocus) { defaultFocus.becomeKeyResponder(); }
        });
    }
});
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
    initialState: 'idle',

    handlebars: "<label class='flame-button-label'>{{title}}</label>",

    render: function(buffer) {
        var height = this.getPath('layout.height');
        if (this.get('useAbsolutePosition') && !Ember.none(height)) buffer.style('line-height', (height-2)+'px');  // -2 to account for borders
        this._super(buffer);
    },

    insertSpace: function(event) {
        this.simulateClick();
        return true;
    },

    idle: Flame.State.extend({
        mouseEnter: function() {
            this.gotoState('hover');
            return true;
        },

        touchStart: function(event) {
            this.gotoState('mouseDownInside');
            return true;
        },

        simulateClick: function() {
            this.gotoState('hover');
            this.get('owner').simulateClick();
            Ember.run.later(this.get('owner'), 'mouseLeave', 150);
        }
    }),

    hover: Flame.State.extend({
        mouseLeave: function() {
            this.gotoState('idle');
            return true;
        },

        mouseDown: function() {
            if (!this.getPath('owner.isDisabled')) {
                this.gotoState('mouseDownInside');
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
                owner.set('isSelected', !owner.get('isSelected'));
            }
        },

        mouseUp: function() {
            this._handleClick();
            this.gotoState('hover');
            return true;
        },

        touchEnd: function(event) {
            this._handleClick();
            this.gotoState('idle');
            return true;
        },

        mouseLeave: function() {
            this.gotoState('mouseDownOutside');
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
            this.gotoState('idle');
            return true;
        },

        mouseEnter: function() {
            this.gotoState('mouseDownInside');
            return true;
        }
    })
});





Flame.AlertPanel = Flame.Panel.extend();

Flame.AlertPanel.INFO_ICON = Flame.image('info_icon.png');
Flame.AlertPanel.WARN_ICON = Flame.image('warn_icon.png');
Flame.AlertPanel.ERROR_ICON = Flame.image('error_icon.png');

Flame.AlertPanel.reopen({
    layout: { centerX: 0, centerY: -50, width: 400, height: 155 },
    classNames: 'flame-alert-panel'.w(),
    icon: Flame.AlertPanel.INFO_ICON,
    isModal: true,
    allowClosingByClickingOutside: false,
    allowMoving: true,
    isCancelVisible: true,
    isConfirmVisible: true,
    isCloseable: true,
    title: '',
    message: '',
    cancelButtonTitle: 'Cancel',
    confirmButtonTitle: 'OK',

    contentView: Flame.View.extend({
        layout: { left: 15, right: 15, top: 36, bottom: 15 },
        childViews: 'iconView messageView cancelButtonView okButtonView'.w(),

        iconView: Flame.ImageView.extend({
            layout: { left: 10, top: 10 },
            valueBinding: '^icon'
        }),

        messageView: Flame.LabelView.extend({
            layout: { left: 75, top: 10, right: 2, bottom: 30 },
            valueBinding: '^message'
        }),

        cancelButtonView: Flame.ButtonView.extend({
            layout: { width: 90, bottom: 2, right: 110 },
            titleBinding: '^cancelButtonTitle',
            isVisibleBinding: '^isCancelVisible',
            action: function() {
                this.getPath('parentView.parentView').onCancel();
            }
        }),

        okButtonView: Flame.ButtonView.extend({
            layout: { width: 90, bottom: 2, right: 2 },
            titleBinding: '^confirmButtonTitle',
            isVisibleBinding: '^isConfirmVisible',
            isDefault: true,
            action: function() {
                this.getPath('parentView.parentView').onConfirm();
            }
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
        return Flame.AlertPanel.create(config);
    },
    warn: function(config) {
        config = jQuery.extend(config || {}, {icon: Flame.AlertPanel.WARN_ICON});
        return Flame.AlertPanel.create(config);
    },
    error: function(config) {
        config = jQuery.extend(config || {}, {icon: Flame.AlertPanel.ERROR_ICON});
        return Flame.AlertPanel.create(config);
    }
});
Flame.CollectionView =  Ember.CollectionView.extend(Flame.LayoutSupport, Flame.EventManager, {
    classNames: ['flame-list-view']
});
Flame.MenuScrollViewButton = Flame.View.extend({
    classNames: "scroll-element".w(),
    classNameBindings: "directionClass isShown".w(),

    directionClass: function() {
        return "scroll-%@".fmt(this.get("direction"));
    }.property(),

    isShown: false,
    direction : "down", // "up" / "down"
    useAbsolutePosition: true,

    mouseLeave: function() {
        if (this.get("isShown")) {
            this.get("parentView").stopScrolling();
            return true;
        }
        return false;
    },
    mouseEnter: function() {
        if (this.get("isShown")) {
            this.get("parentView").startScrolling(this.get("direction") === "up" ? -1 : 1);
            return true;
        }
        return false;
    },

    // Eat the clicks and don't pass them to the elements beneath.
    mouseDown: function() { return true; },
    mouseUp: function() { return true; }
});

Flame.MenuScrollView = Flame.View.extend({
    classNames: 'menu-scroll-view'.w(),
    useAbsolutePosition: true,
    needScrolling: false,
    scrollDirection: 0,
    scrollPosition: "top", //"top", "middle", "bottom"

    childViews: "upArrow viewPort downArrow".w(),
    scrollSize: 10, //How many pixels to scroll per scroll

    viewPort: Flame.View.extend({
        useAbsolutePosition: true,
        classNames: "scroll-view-viewport".w()
    }),

    upArrow: Flame.MenuScrollViewButton.extend({direction:"up", layout: {height: 20, top: 0, width: "100%"}}),
    downArrow: Flame.MenuScrollViewButton.extend({direction:"down", layout: {height: 20, bottom: 0, width: "100%"}}),

    willDestroyElement: function() {
        this._super();
        this.stopScrolling();
    },

    setScrolledView: function(newContent) {
        this.getPath("viewPort.childViews").replace(0, 1, [newContent]);
    },

    scrollPositionDidChange: function() {
        var upArrow = this.get("upArrow");
        var downArrow = this.get("downArrow");
        var scrollPosition = this.get("scrollPosition");
        upArrow.set("isShown", this.get("needScrolling") && scrollPosition !== "top");
        downArrow.set("isShown", this.get("needScrolling") && scrollPosition !== "bottom");

    }.observes("scrollPosition", "needScrolling"),

    startScrolling: function(scrollDirection) {
        this.set("scrollDirection", scrollDirection);
        this.scroll();
    },

    stopScrolling: function() {
        this.set("scrollDirection", 0);
        if (this._timer) {
            Ember.run.cancel(this._timer);
        }
    },

    _recalculateSizes: function() {
        var height = this.getPath("parentView.layout.height");
        if (height > 0) {
            var paddingAndBorders = 5 + 5 + 1 + 1;  // XXX obtain paddings & borders from MenuView?
            this.set("layout", {height: height - paddingAndBorders, width: "100%"});
            var viewPort = this.get("viewPort");
            if (viewPort) {
                viewPort.set("layout", {
                    height: height - paddingAndBorders,
                    top: 0,
                    width: "100%"
                });
            }
        }
    }.observes("parentView.layout.height", "needScrolling"),

    _scrollTo: function(position, scrollTime) {
        var viewPort = this.get("viewPort").$();
        viewPort.scrollTop(position);
    },

    scroll: function() {
        var scrollDirection = this.get("scrollDirection");
        var scrollTime = 20;
        var scrollSize = this.get("scrollSize");
        var viewPort = this.get("viewPort").$();
        var oldTop = viewPort.scrollTop();
        var viewPortHeight = viewPort.height();
        var continueScrolling = true;
        var scrollPosition = this.get("scrollPosition");

        var delta = scrollSize;
        if (scrollDirection === -1) {
            if (delta > oldTop) {
                delta = oldTop;
                continueScrolling = false;
            }
        } else if (scrollDirection === 1) {
            var listHeight = this.getPath("viewPort.childViews.firstObject").$().outerHeight();
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
                scrollPosition = "bottom";
            } else if (scrollDirection === -1) {
                scrollPosition = "top";
            }
            this.stopScrolling();
        } else {
            this._timer = Ember.run.later(this, this.scroll, scrollTime);
            scrollPosition = "middle";
        }
        this.set("scrollPosition", scrollPosition);
    }
});





// Only to be used in Flame.MenuView. Represent menu items with normal JS objects as creation of one Ember object took
// 3.5 ms on fast IE8 machine.
Flame.MenuItem = function(opts) {
    var key;
    for (key in opts) {
        if (opts.hasOwnProperty(key)) {
            this[key] = opts[key];
        }
    }

    this.renderToElement = function () {
        var classes = ["flame-view", "flame-list-item-view", "flame-menu-item-view"];
        if (this.isSelected) { classes.push("is-selected"); }
        if (this.isChecked) { classes.push("is-checked"); }
        var subMenuLength = Ember.none(this.subMenuItems) ? -1 : this.subMenuItems.get('length');
        var menuIndicatorClasses = ["menu-indicator"];
        if (!this.isEnabled()) {
            classes.push("is-disabled");
        } else if (subMenuLength > 0) {
            menuIndicatorClasses.push("is-enabled");
        }
        var title = Handlebars.Utils.escapeExpression(this.title);
        var template = "<div id='%@' class='%@'><div class='title'>%@</div><div class='%@'></div></div>";
        var div = template.fmt(this.id, classes.join(" "), title, menuIndicatorClasses.join(" "));
        return div;
    };

    this.isEnabled = function() {
        return !(this.isDisabled || (this.subMenuItems && this.subMenuItems.length === 0));
    };
    this.isSelectable = function() {
        return this.isEnabled() && !this.subMenuItems;
    };
    this.elementSelector = function() {
        return Ember.$("#%@".fmt(this.id));
    };
    this.closeSubMenu = function() {
        var subMenu = this.subMenuView;
        if (!Ember.none(subMenu)) {
            subMenu.close();
            this.subMenuView = null;
        }
    };
};

/**
  A menu. Can be shown as a "stand-alone" menu or in cooperation with a SelectButtonView.

  MenuView has a property 'subMenuKey'. Should objects based on which the menu is created return null/undefined for
  that property, the item itself will be selectable. Otherwise if the property has more than zero values, a submenu
  will be shown.
*/
Flame.MenuView = Flame.Panel.extend(Flame.ActionSupport, {
    classNames: ['flame-menu'],
    childViews: ['contentView'],
    contentView: Flame.MenuScrollView,
    dimBackground: false,
    subMenuKey: 'subMenu',
    itemTitleKey: "title",
    /* Attribute that can be used to indicate a disabled menu item. The item will be disabled only if
     * isEnabled === false, not some falseish value. */
    itemEnabledKey: "isEnabled",
    itemCheckedKey: "isChecked",
    itemValueKey: "value",
    itemActionKey: "action",
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
    highlightIndex: -1, // Currently highlighted index.
    userHighlightIndex: -1, // User selected highlighted index
    // Reflects the content item in this menu or the deepest currently open submenu that is currently highlighted,
    // regardless of whether mouse button is up or down. When mouse button is released, this will be set as the real
    // selection on the top-most menu, unless it's undefined (happens if currently on a non-selectable item)
    internalSelection: undefined,

    init: function() {
        this._super();
        this._needToRecreateItems();
    },

    _calculateMenuWidth: function() {
        var items = this.get("items") || [];
        if (Ember.get(items, 'length') === 0) {
            return;
        }
        var itemTitleKey = this.get("itemTitleKey");
        var allTitles = items.reduce(function(currentTitles, item) {
            var nextTitle = Ember.get(item, itemTitleKey);
            return currentTitles + nextTitle + '<br/>';
        }, '');
        // Give the menus a 16px breathing space to account for sub menu indicator, and to give some right margin
        return Flame.measureString(allTitles, 'ember-view flame-view flame-list-item-view flame-menu-item-view', 'title').width + 16;
    },

    _createMenuItems: function() {
        var items = this.get("items"),
            itemCheckedKey = this.get("itemCheckedKey"),
            itemEnabledKey = this.get("itemEnabledKey"),
            itemTitleKey = this.get("itemTitleKey"),
            itemValueKey = this.get("itemValueKey"),
            subMenuKey = this.get("subMenuKey"),
            selectedValue = this.get("value"),
            menuItems;
        menuItems = (items || []).map(function(item, i) {
            //Only show the selection on the main menu, not in the submenus.
            return new Flame.MenuItem({
                item: item,
                isSelected: Ember.get(item, itemValueKey) === selectedValue,
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
        this.set("_menuItems", menuItems);
        if (Ember.none(this.get("parentMenu"))) {
            menuItems.forEach(function(item, i) {
                if (item.isSelected) { this.set("highlightIndex", i); }
            }, this);
        }
        this.getPath("contentView").setScrolledView(this._createMenuView());
        if (this.get("_anchorElement")) {
            this._updateMenuSize();
        }

        //Set content of scroll stuff
        //calculate the the height of menu
    }.observes("items", "elementId"),

    _createMenuView: function() {
        var items = this.get("_menuItems");
        return Flame.View.create({
            useAbsolutePosition:false,
            render: function(renderingBuffer) {
                // Push strings to rendering buffer with one pushObjects call so we don't get one arrayWill/DidChange
                // per menu item.
                var tempArr = items.map(function(menuItem) { return menuItem.renderToElement(); });
                renderingBuffer.push(tempArr.join(''));
            }
        });
    },

    makeSelection: function() {
        var parentMenu = this.get("parentMenu");
        var action, value;
        if (!Ember.none(parentMenu)) {
            parentMenu.makeSelection();
            this.close();
        } else {
            var internalSelection = this.get('internalSelection');
            if (typeof internalSelection !== "undefined") {
                value = Ember.get(internalSelection, this.get("itemValueKey"));
                this.set("value", value);
                //If we have an action, call it on the selection.
                action = Ember.get(internalSelection, this.get("itemActionKey")) || this.get('action');
            }
            //Sync the values before we tear down all bindings in close() which calls destroy().
            Ember.run.sync();
            // Close this menu before firing an action - the action might open a new popup, and if closing after that,
            // the new popup panel is popped off the key responder stack instead of this menu.
            this.close();
            if (!Ember.none(action)) {
                this.fireAction(action, value);
            }
        }
    },

    //This function is here to break the dependency between MenuView and MenuItemView
    createSubMenu: function(subMenuItems) {
        return Flame.MenuView.create({
            items: subMenuItems,
            parentMenu: this,
            subMenuKey: this.get("subMenuKey"),
            itemEnabledKey: this.get("itemEnabledKey"),
            itemTitleKey: this.get("itemTitleKey"),
            itemValueKey: this.get("itemValueKey"),
            itemHeight: this.get("itemHeight"),
            isModal: false
        });
    },

    closeCurrentlyOpenSubMenu: function() {
        // observers of highlightIndex should take care that closing is propagated to the every open menu underneath
        // this menu. Close() sets highlightIndex to -1, _highlightWillChange() will call closeSubMenu() on the item
        // which then calls close() on the menu it depicts and this is continued until no open menus remain under the
        // closed menu.
        var index = this.get("highlightIndex");
        if (index >= 0) {
            this.get("_menuItems").objectAt(index).closeSubMenu();
        }
    },

    popup: function(anchorElementOrJQ, position) {
        if (Ember.none(this.get('parentMenu'))) {
            this._openedAt = new Date().getTime();
        }
        var anchorElement = anchorElementOrJQ instanceof jQuery ? anchorElementOrJQ : anchorElementOrJQ.$();
        this._super(anchorElement, position);
        this.set("_anchorElement", anchorElement);
        this._updateMenuSize();
    },

    _updateMenuSize: function() {
        var anchorElement = this.get("_anchorElement");
        //These values come from the CSS but we still need to know them here. Is there a better way?
        var paddingTop = 5;
        var paddingBottom = 5;
        var borderWidth = 1;
        var totalPadding = paddingTop + paddingBottom;
        var margin = this.get("menuMargin");
        var menuOuterHeight = this.get("_menuItems").get("length") * this.get("itemHeight") + totalPadding + 2 * borderWidth;
        var wh = $(window).height();
        var anchorTop = anchorElement.offset().top;
        var anchorHeight = anchorElement.outerHeight();
        var layout = this.get("layout");

        var isSubMenu = !Ember.none(this.get("parentMenu"));
        var spaceDownwards = wh - anchorTop + (isSubMenu ? (borderWidth + paddingTop) : (-anchorHeight));
        var needScrolling = false;

        if (menuOuterHeight + margin * 2 <= wh) {
            if (isSubMenu && spaceDownwards >= menuOuterHeight + margin) {
                layout.set("top", anchorTop - (borderWidth + paddingTop));
            } else if (spaceDownwards < menuOuterHeight + margin) {
                layout.set("top", wh - (menuOuterHeight + margin));
            }
        } else {
            // Constrain menu height
            menuOuterHeight = wh - 2 * margin;
            layout.set("top", margin);
            needScrolling = true;
        }
        layout.set("height", menuOuterHeight);
        if (!layout.width) {
            var menuWidth = Math.max(this.get('minWidth') || 0, this._calculateMenuWidth());
            layout.set("width", menuWidth);
        }
        this.set("layout", layout);
        this.get("contentView").set("needScrolling", needScrolling);
    },

    close: function() {
        if (this.isDestroyed) { return; }
        this.set("highlightIndex", -1);
        this._clearKeySearch();
        this._super();
    },

    /* event handling starts */
    mouseDown: function () {
        return true;
    },

    cancel: function() {
        this.close();
    },

    moveUp: function() { return this._selectNext(-1); },
    moveDown: function() { return this._selectNext(1); },

    moveRight: function() {
        this._tryOpenSubmenu(true);
        return true;
    },

    moveLeft: function() {
        var parentMenu = this.get("parentMenu");
        if (!Ember.none(parentMenu)) { parentMenu.closeCurrentlyOpenSubMenu(); }
        return true;
    },

    insertNewline: function() {
        this.makeSelection();
        return true;
    },

    keyPress: function(event) {
        var key = String.fromCharCode(event.which);
        if (event.which > 31 && key !== "") { //Skip control characters.
            this._doKeySearch(key);
            return true;
        }
        return false;
    },

    handleMouseEvents: function (event) {
        // This should probably be combined with our event handling in event_manager.
        var itemIndex = this._idToIndex(event.currentTarget.id);
        // jQuery event handling: false bubbles the stuff up.
        var retVal = false;

        if (event.type === "mouseenter") {
            retVal = this.mouseEntered(itemIndex);
        } else if (event.type === "mouseup") {
            retVal = this.mouseClicked(itemIndex);
        } else if (event.type === "mousedown") {
            retVal = true;
        }
        return !retVal;
    },

    /* Event handling ends */

    mouseClicked: function(index) {
        // If we're just handling a mouseUp that is part of the click that opened this menu, do nothing.
        // When the mouseUp follows within 100ms of opening the menu, we know that's the case.
        if (Ember.none(this.get('parentMenu')) && new Date().getTime() - this._openedAt < 100) {
            return;
        }

        this.set("highlightIndex", index);
        // This will currently select the item even if we're not on the the current menu. Will need to figure out how
        // to deselect an item when cursor leaves the menu totally (that is, does not move to a sub-menu).
        if (this.get('userHighlightIndex') >= 0) {
            this.makeSelection();
        }
        return true;
    },

    mouseEntered: function(index) {
        this.set("userHighlightIndex", index);
        this._tryOpenSubmenu(false);
        return true;
    },

    _selectNext: function(increment) {
        var menuItems = this.get("_menuItems");
        var len = menuItems.get("length");
        var item;
        var index = this.get("highlightIndex") + increment;
        for (; index >= 0 && index < len; index += increment) {
            item = menuItems.objectAt(index);
            if (item.isEnabled()) {
                this.set("highlightIndex", index);
                break;
            }
        }
        this._clearKeySearch();
        return true;
    },

    _valueDidChange: function() {
        var value = this.get("value");
        var valueKey = this.get("itemValueKey");
        if (!Ember.none(value) && !Ember.none(valueKey)) {
            var index = this._findIndex(function(item) {
                return Ember.get(item, valueKey) === value;
            });
            if (index >= 0) {
                this.set("highlightIndex", index);
            }
        }
    }.observes("value"),

    // Propagate internal selection to possible parent
    _internalSelectionDidChange: function() {
        var selected = this.get('internalSelection');
        Ember.trySetPath(this, "parentMenu.internalSelection", selected);
    }.observes('internalSelection'),

    _findIndex: function(identityFunc) {
        var menuItems = this.get("items");
        var i = 0, len = menuItems.get("length");
        for (; i < len; i++) {
            if (identityFunc(menuItems.objectAt(i))) {
                return i;
            }
        }
        return -1;
    },

    _findByName: function(name) {
        var re = new RegExp("^" + name, "i");
        var titleKey = this.get("itemTitleKey");
        return this._findIndex(function(menuItem) {
            return re.test(Ember.get(menuItem, titleKey));
        });
    },

    _toggleClass: function(className, index, addOrRemove) {
        var menuItem = this.get("_menuItems").objectAt(index);
        menuItem.elementSelector().toggleClass(className, addOrRemove);
    },

    _highlightWillChange: function() {
        var index = this.get("highlightIndex");
        var lastItem = this.get("_menuItems").objectAt(index);
        if (!Ember.none(lastItem)) {
            this._toggleClass("is-selected", index);
            lastItem.isSelected = false;
            lastItem.closeSubMenu();
        }
    }.observesBefore("highlightIndex"),

    _highlightDidChange: function() {
        var index = this.get("highlightIndex");
        var newItem = this.get("_menuItems").objectAt(index);
        var internalSelection;
        if (!Ember.none(newItem)) {
            this._toggleClass("is-selected", index);
            newItem.isSelected = true;
            if (newItem.isSelectable()) {
                internalSelection = newItem.item;
            }
        }
        this.set('internalSelection', internalSelection);

    }.observes("highlightIndex"),

    /**
      We only want to allow selecting menu items after the user has moved the mouse. We update
      userHighlightIndex when user highlights something, and internally we use highlightIndex to keep
      track of which item is highlighted, only allowing selection if user has highlighted something.
      If we don't ensure the user has highlighted something before allowing selection, this means that when
      a user clicks a SelectViewButton to open a menu, the mouseUp event (following the mouseDown on the select)
      would be triggered on a menu item, and this would cause the menu to close immediately.
    */
    _userHighlightIndexDidChange: function() {
        this.set('highlightIndex', this.get('userHighlightIndex'));
    }.observes("userHighlightIndex"),

    _clearKeySearch: function() {
        if (!Ember.none(this._timer)) {
            Ember.run.cancel(this._timer);
        }
        this._searchKey = "";
    },

    _doKeySearch: function(key) {
        this._searchKey = (this._searchKey || "") + key;
        var index = this._findByName(this._searchKey);
        if (index >= 0) {
            this.set("highlightIndex", index);
        }

        if (!Ember.none(this._timer)) {
            Ember.run.cancel(this._timer);
        }
        this._timer = Ember.run.later(this, this._clearKeySearch, 1000);
    },

    _indexToId: function(index) {
        return "%@-%@".fmt(this.get("elementId"), index);
    },

    _idToIndex: function(id) {
        var re = new RegExp("%@-(\\d+)".fmt(this.get("elementId")));
        var res = re.exec(id);
        return res && res.length === 2 ? parseInt(res[1], 10) : -1;
    },

    _tryOpenSubmenu: function (selectItem) {
        var index = this.get("highlightIndex");
        var item = this.get("_menuItems").objectAt(index);
        if (!item) {
            return false;
        }
        var subMenuItems = item.subMenuItems;
        if (!Ember.none(subMenuItems) && item.isEnabled() && subMenuItems.get("length") > 0) {
            this._clearKeySearch();
            var subMenu = item.subMenuView;
            if (Ember.none(subMenu)) {
                subMenu = this.createSubMenu(subMenuItems);
                item.subMenuView = subMenu;
            }
            subMenu.popup(item.elementSelector(), Flame.POSITION_RIGHT);
            if (selectItem) { subMenu._selectNext(1); }
            return true;
        }
        return false;
    },

    didInsertElement: function() {
        this._super();
        var self = this;
        var id = this.get("elementId");
        var events = "mouseenter.%@ mouseup.%@ mousedown.%@".fmt(id, id, id);
        Ember.$("#%@".fmt(id)).on(events, ".flame-menu-item-view", function(event) {
            return self.handleMouseEvents(event);
        });
    }
});
Flame.AutocompleteMenuView = Flame.MenuView.extend({
    keyPress: function(event) {
        return false;
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


// A checkbox. The state of the checkbox is indicated by the isSelected property (in SC1.x it was value).
Flame.CheckboxView = Flame.ButtonView.extend({
    classNames: ['flame-checkbox-view'],
    isSticky: true,
    //Overwrite the parent handlebars as we're using render all the way!
    handlebars: null,

    render: function(context) {
        this._super(context);
        context.push("<div class='flame-checkbox-box'></div>");
        this.renderCheckMark(context);
        var title = Ember.none(this.get("title")) ? "" : this.get("title");
        context.push("<label class='flame-checkbox-label'>" + title + "</label>");
    },

    renderCheckMark: function(context) {
        var imgUrl = Flame.image('checkmark.png');
        context.push("<div class='flame-view flame-checkbox-checkmark' style='left:6px; top:-2px;'><img src='"+ imgUrl + "'></div>");
    }
});
Flame.SelectButtonView = Flame.ButtonView.extend({
    classNames: ['flame-select-button-view'],
    items: [],
    value: undefined,
    defaultHeight: 22,
    itemTitleKey: 'title',
    itemValueKey: 'value',
    itemActionKey: 'action',
    subMenuKey: "subMenu",

    handlebars: function() {
        var itemTitleKey = this.get('itemTitleKey');
        return '<label {{bindAttr title="_selectedMenuItem.%@"}}>{{_selectedMenuItem.%@}}</label><div><img src="%@"></div>'.fmt(itemTitleKey, itemTitleKey, Flame.image('select_button_arrow.png'));
    }.property("value", "_selectedMenuItem").cacheable(),

    _selectedMenuItem: function() {
        if (this.get('value') === undefined) { return undefined; }
        var selectedItem = this._findItem();
        return selectedItem;
    }.property("value", "itemValueKey", "subMenuKey", "items").cacheable(),

    itemsDidChange: function() {
        if (this.get('items') && this.getPath('items.length') > 0 && !this._findItem()) {
            this.set('value', this.getPath('items.firstObject.%@'.fmt(this.get('itemValueKey'))));
        }
    }.observes('items'),

    _findItem: function(itemList) {
        if (!itemList) itemList = this.get('items');
        var itemValueKey = this.get('itemValueKey'),
            value = this.get('value'),
            subMenuKey = this.get('subMenuKey'),
            foundItem;
        if (Ember.none(itemList)) { return foundItem; }
        itemList.forEach(function(item) {
            if (Ember.get(item, subMenuKey)) {
                var possiblyFound = this._findItem(Ember.get(item, subMenuKey));
                if (!Ember.none(possiblyFound)) { foundItem = possiblyFound; }
            } else if (Ember.get(item, itemValueKey) === value) {
                foundItem = item;
            }
        }, this);
        return foundItem;
    },

    menu: function() {
        // This has to be created dynamically to set the selectButtonView reference (parentView does not work
        // because a menu is added on the top level of the view hierarchy, not as a children of this view)
        var self = this;
        return Flame.MenuView.extend({
            selectButtonView: this,
            itemTitleKey: this.get('itemTitleKey'),
            itemValueKey: this.get('itemValueKey'),
            itemActionKey: this.get('itemActionKey'),
            subMenuKey: this.get('subMenuKey'),
            itemsBinding: 'selectButtonView.items',
            valueBinding: 'selectButtonView.value',
            minWidth: this.getPath('layout.width') || this.$().width(),
            close: function() {
                self.gotoState('idle');
                this._super();
            }
        });
    }.property(),

    mouseDown: function() {
        if (!this.get('isDisabled')) this._openMenu();
        return true;
    },

    insertSpace: function() {
        this._openMenu();
        return true;
    },

    _openMenu: function() {
        this.gotoState('mouseDownInside');
        this.get('menu').create().popup(this);
    }
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
    isAutocomplete: false,
    autocompleteDelegate: null,
    name: null,

    becomeKeyResponder: function() {
        this.get('textField').becomeKeyResponder();
    },

    insertNewline: function() {
        return this.fireAction();
    },

    textField: Ember.TextField.extend(Flame.EventManager, Flame.FocusSupport, {
        classNameBindings: ['isInvalid', 'isEditableLabel', 'isFocused'],
        acceptsKeyResponder: true,
        type: Flame.computed.trueFalse('parentView.isPassword', 'password', 'text'),
        isInvalid: Flame.computed.equals('parentView.isValid', false),
        valueBinding: '^value',
        placeholderBinding: '^placeholder',
        isEditableLabelBinding: '^isEditableLabel',
        isVisibleBinding: '^isVisible',
        disabledBinding: '^isDisabled',
        isAutocompleteBinding: '^isAutocomplete',
        attributeBindings: ['name', 'disabled'],
        nameBinding: "^name",

        // Ember.TextSupport (which is mixed in by Ember.TextField) calls interpretKeyEvents on keyUp.
        // Since the event manager already calls interpretKeyEvents on keyDown, the action would be fired
        // twice, both on keyDown and keyUp. So we override the keyUp method and only record the value change.
        keyUp: function(event) {
            this._elementValueDidChange();
            if ((event.which === 8 || event.which > 31) && this.get('isAutocomplete')) {
                this.get('parentView')._fetchAutocompleteResults();
                return true;
            }
            return false;
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
    }),

    _autocompleteView: null,

    _fetchAutocompleteResults: function() {
        // Don't want to wait until the value has synced, so just grab the raw val from input
        var newValue = this.$('input').val();
        if (newValue) {
            this.get('autocompleteDelegate').fetchAutocompleteResults(newValue, this);
        } else {
            this._closeAutocompleteMenu();
        }
    },

    didFetchAutocompleteResults: function(options) {
        if (options.length === 0) {
            this._closeAutocompleteMenu();
            return;
        }
        if (!this._autocompleteMenu || this._autocompleteMenu.isDestroyed) {
                this._autocompleteMenu = Flame.AutocompleteMenuView.create({
                    minWidth: this.$().width(),
                    target: this,
                    textField: this.textField,
                    action: '_selectAutocompleteItem',
                    items: options
                });
                this._autocompleteMenu.popup(this);
        } else if (!this._autocompleteMenu.isDestroyed) {
            this._autocompleteMenu.set('items', options);
        }
    },

    _closeAutocompleteMenu: function() {
        if (this._autocompleteMenu){
            this._autocompleteMenu.close();
            this._autocompleteMenu = null;
        }
    },

    _selectAutocompleteItem: function(id) {
        this.set('value', this._autocompleteMenu.get('items').findProperty('value', id).title);
    }

});




Flame.ComboBoxView = Flame.SelectButtonView.extend({
    classNames: ['flame-combo-box-view'],
    childViews: 'textView buttonView'.w(),
    handlebars: undefined,
    acceptsKeyResponder: false,

    textView: Flame.TextFieldView.extend({
        layout: { left: 0, right: 3 },
        valueBinding: 'parentView.value'
    }),

    insertSpace: function() { return false; },

    buttonView: Flame.ButtonView.extend({
        acceptsKeyResponder: false,
        handlebars: '<img src="%@">'.fmt(Flame.image('select_button_arrow.png')),
        layout: { right: -2, width: 22, height: 22 },

        action: function() {
            this.get('parentView')._openMenu();
        }
    })
});

Flame.DisclosureView = Flame.LabelView.extend({
    classNames: ['flame-disclosure-view'],

    imageExpanded: Flame.image('disclosure_triangle_down.png'),
    imageCollapsed: Flame.image('disclosure_triangle_left.png'),

    image: function() {
        return this.get('visibilityTarget') ? this.get('imageExpanded') : this.get('imageCollapsed');
    }.property('visibilityTarget', 'imageExpanded', 'imageCollapsed'),

    handlebars: '<img {{bindAttr src="image"}}> {{value}}',

    action: function() {
        var value = this.getPath('visibilityTarget');
        this.setPath('visibilityTarget', !value);
        return true;
    }
});
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

        this.set('layoutManager', Flame.VerticalStackLayoutManager.create({
            topMargin: this.get('topMargin'),
            spacing: this.get('rowSpacing'),
            bottomMargin: this.get('bottomMargin')
        }));

        this.set('_errorViews', []);
        this.set('controls', []);

        this._propertiesDidChange();
    },

    _propertiesDidChange: function() {
        this.destroyAllChildren();

        var self = this;
        var childViews = this.get('childViews');
        this.get('properties').forEach(function(descriptor) {
            var view = self._createLabelAndControl(descriptor);
            childViews.push(self.createChildView(view));
        });

        var buttons = this.get('buttons');
        if (buttons && buttons.get('length') > 0) {
            childViews.push(this.createChildView(this._buildButtons(buttons)));
        }
    }.observes('properties.@each'),

    _createLabelAndControl: function(descriptor) {
        descriptor = Ember.Object.create(descriptor);
        var control = descriptor.view || this._buildControl(descriptor);
        var formView = this;

        if (Ember.none(descriptor.label)) {
            return this._createChildViewWithLayout(control, this, this.get('leftMargin') + this._focusRingMargin, this.get('rightMargin') + this._focusRingMargin);
        }
        if (descriptor.type === 'checkbox') {
            return this._createChildViewWithLayout(control, this, this.get('leftMargin') + this.labelWidth + this.columnSpacing - 4, this._focusRingMargin);
        }

        var view = {
            layout: { left: this.get('leftMargin'), right: this.get('rightMargin') },
            layoutManager: Flame.VerticalStackLayoutManager.create({ topMargin: this._focusRingMargin, spacing: 0, bottomMargin: this._focusRingMargin }),
            childViews: ['label', 'control'],

            isVisible: descriptor.get('isVisible') === undefined ? true : descriptor.get('isVisible'),

            label: this._buildLabel(descriptor),
            control: function () {
                return formView._createChildViewWithLayout(control, this, formView.labelWidth + formView.columnSpacing, formView._focusRingMargin);
            }.property().cacheable()
        };
        if (descriptor.get('isVisibleBinding')) view.isVisibleBinding = descriptor.get('isVisibleBinding');

        return Flame.View.extend(view);
    },

    _createChildViewWithLayout: function(view, parent, leftMargin, rightMargin) {
        var childView = parent.createChildView(view);
        if (!childView.get('layout')) childView.set('layout', {});
        childView.setPath('layout.left', leftMargin);
        childView.setPath('layout.right', rightMargin);
        return childView;
    },

    _buildLabel: function(descriptor) {
        return Flame.LabelView.extend({
            layout: { left: 0, width: this.get('labelWidth'), top: this._focusRingMargin },
            ignoreLayoutManager: true,
            textAlign: this.get('labelAlign'),
            value: descriptor.get('label') + ':',
            attributeBindings: ['title'],
            title: descriptor.get('label')
        });
    },

    _buildButtons: function(buttons) {
        var formView = this;
        return Flame.View.extend({
            layout: { left: this.get('leftMargin'), right: this.get('rightMargin'), topMargin: this.get('buttonSpacing'), height: 30 },
            init: function() {
                this._super();
                var childViews = this.get('childViews');
                var right = formView._focusRingMargin;
                var self = this;
                (buttons || []).forEach(function(descriptor) {
                    var buttonView = self.createChildView(formView._buildButton(descriptor, right));
                    right += (buttonView.getPath('layout.width') || 0) + 15;
                    childViews.push(buttonView);
                });
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

        //if an explicit target is set, we don't want the default targetBinding to be used
        if (descriptor.target) {
            delete properties.targetBinding;
        }

        return Flame.ButtonView.extend(properties);
    },

    _buildValidationObservers: function(validationMessage) {
        if (Ember.none(validationMessage)) return {};

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
                    self._errorViews = self._errorViews.without(errorView);
                }
            }.observesBefore('isValid'),

            isValidDidChange: function() {
                if (!this.get('isValid') && !this.get('_errorView')) {
                    var element = this.$();
                    var offset = element.offset();

                    // This is strictly not necessary, but currently you can save invalid form with enter, which then fails here
                    if (Ember.none(offset)) return;

                    var zIndex = Flame._zIndexCounter;
                    var errorMessage = validationMessage;
                    if (jQuery.isFunction(validationMessage)) {
                        // XXX This will only work with controls with the value in the 'value' property
                        errorMessage = validationMessage(this.get('value'));
                    }
                    var errorView = Flame.LabelView.extend({
                        classNames: 'flame-form-view-validation-error'.w(),
                        textAlign: Flame.ALIGN_LEFT,
                        layout: { top: offset.top - 7, left: offset.left + element.outerWidth() - 4, width: null, height: null, zIndex: zIndex },
                        value: errorMessage,
                        handlebars: '<div class="error-triangle"></div><div class="error-box">{{value}}</div>'
                    }).create().append();

                    this.set("_errorView", errorView);
                    self._errorViews.push(errorView);
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
        // XXX it would be better to cache this, but since it's only a temporary solution and because it's fast
        // enough even in IE8, it's not worth the effort.
        // Collect all controls that can have keyResponder status
        var controls = this.get('childViews').mapProperty('childViews').flatten().filter(function(view) {
            return view.get('acceptsKeyResponder') && view.get('isVisible');
        });
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
        var settings = {
            layout: { topPadding: 1, bottomPadding: 1, width: this.get('controlWidth') },
            valueBinding: '^object.%@'.fmt(property),
            isValid: Flame.computed.notEquals('parentView.parentView.object.%@IsValid'.fmt(property), false),
            isDisabled: Flame.computed.equals('parentView.parentView.object.%@IsDisabled'.fmt(property), true)
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
        if (Ember.none(settings.action) && (type === 'text' || type === 'textarea' || type === 'password')) {
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
                if (descriptor.isAutocomplete) {
                    settings.isAutocomplete = true;
                    settings.autocompleteDelegate = descriptor.autocompleteDelegate;
                }
                settings.name = Ember.none(descriptor.name) ? descriptor.property : descriptor.name;
                return Flame.TextFieldView.extend(settings);
            case 'textarea':
                settings.layout.height = descriptor.height || 70;
                return Flame.TextAreaView.extend(settings);
            case 'password':
                settings.isPassword = true;
                settings.name = Ember.none(descriptor.name) ? descriptor.property : descriptor.name;
                return Flame.TextFieldView.extend(settings);
            case 'html':
                return Flame.LabelView.extend(jQuery.extend(settings, {escapeHTML: false, formatter: function(val) {
                    return val === null ? '' : val;
                }}));
            case 'checkbox':
                settings.title = descriptor.label;
                settings.isSelectedBinding = settings.valueBinding;
                delete settings.valueBinding;
                return Flame.CheckboxView.extend(settings);
            case 'select':
                settings.itemValueKey = descriptor.itemValueKey || "value";
                settings.subMenuKey = descriptor.subMenuKey || "subMenu";
                if (descriptor.optionsBinding) {
                    settings.itemTitleKey = descriptor.itemTitleKey || "name";
                    settings.itemsBinding = descriptor.optionsBinding;
                } else if (descriptor.options) {
                    settings.itemTitleKey = descriptor.itemTitleKey || "title";
                    settings.items = descriptor.options;
                }
                if (!descriptor.get('allowNew')) {
                    return Flame.SelectButtonView.extend(settings);
                } else {
                    return Flame.ComboBoxView.extend(settings);
                }
        }
        throw 'Invalid control type %@'.fmt(type);
    },

    willDestroyElement: function() {
        this._errorViews.forEach(function(e) { e.remove(); });
    }
});
Flame.SplitView = Flame.View.extend({
    allowResizing: true,
    dividerThickness: 7,

    dividerView: Flame.View.extend(Flame.Statechart, {
        classNames: 'flame-split-view-divider'.w(),
        initialState: 'idle',

        idle: Flame.State.extend({
            mouseDown: function(event) {
                var parentView = this.getPath('owner.parentView');
                if (!parentView.get('allowResizing')) return false;
                parentView.startResize(event);
                this.gotoState('resizing');
                return true;
            },

            touchStart: function(event) {
                // Normalize the event and send it to mouseDown
                this.mouseDown(this.normalizeTouchEvents(event));
                return true;
            },

            doubleClick: function(event) {
                var parentView = this.getPath('owner.parentView');
                if (!parentView.get('allowResizing')) return false;
                parentView.toggleCollapse(event);
                return true;
            }
        }),

        resizing: Flame.State.extend({
            mouseMove: function(event) {
                this.getPath('owner.parentView').resize(event);
                return true;
            },

            touchMove: function(event) {
                // Don't scroll the page while we're doing this
                event.preventDefault();
                // Normalize the event and send it to mouseDown
                this.mouseMove(this.normalizeTouchEvents(event));
                return true;
            },

            mouseUp: Flame.State.gotoHandler('idle'),
            touchEnd: Flame.State.gotoHandler('idle')
        })
    })
});


/*
 * HotizontalSplitView divides the current view between topView and bottomView using a horizontal
 * dividerView.
 */

Flame.HorizontalSplitView = Flame.SplitView.extend({
    classNames: 'flame-horizontal-split-view'.w(),
    childViews: 'topView dividerView bottomView'.w(),
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
        Ember.assert('Flame.HorizontalSplitView needs topView and bottomView!', !!this.get('topView') && !!this.get('bottomView'));
        this._super();

        if (this.get('flex') === 'bottom') this.bottomHeight = undefined;
        else this.topHeight = undefined;

        this._updateLayout();  // Update layout according to the initial heights

        this.addObserver('topHeight', this, this._updateLayout);
        this.addObserver('bottomHeight', this, this._updateLayout);
        this.addObserver('minTopHeight', this, this._updateLayout);
        this.addObserver('minBottomHeight', this, this._updateLayout);
    },

    _updateLayout: function() {
        var topView = this.get('topView');
        var dividerView = this.get('dividerView');
        var bottomView = this.get('bottomView');

        var totalHeight = this.$().innerHeight();
        var dividerThickness = this.get('dividerThickness');
        var topHeight = this.get('flex') === 'bottom' ? this.get('topHeight') : undefined;
        var bottomHeight = this.get('flex') === 'top' ? this.get('bottomHeight') : undefined;
        if (topHeight === undefined && bottomHeight !== undefined && totalHeight !== null) topHeight = totalHeight - bottomHeight - dividerThickness;
        if (bottomHeight === undefined && topHeight !== undefined && totalHeight !== null) bottomHeight = totalHeight - topHeight - dividerThickness;

        if ('number' === typeof topHeight && topHeight < this.get('minTopHeight')) {
            bottomHeight += topHeight - this.get('minTopHeight');
            topHeight = this.get('minTopHeight');
        }
        if ('number' === typeof bottomHeight && bottomHeight < this.get('minBottomHeight')) {
            topHeight += bottomHeight - this.get('minBottomHeight');
            bottomHeight = this.get('minBottomHeight');
        }
        this.set('topHeight', topHeight);
        this.set('bottomHeight', bottomHeight);

        if (this.get('flex') === 'bottom') {
            this._setDimensions(topView, 0, topHeight, undefined);
            this._setDimensions(dividerView, topHeight, dividerThickness, undefined);
            this._setDimensions(bottomView, topHeight + dividerThickness, undefined, 0);
        } else {
            this._setDimensions(topView, 0, undefined, bottomHeight + dividerThickness);
            this._setDimensions(dividerView, undefined, dividerThickness, bottomHeight);
            this._setDimensions(bottomView, undefined, bottomHeight, 0);
        }
    },

    _setDimensions: function(view, top, height, bottom) {
        var layout = view.get('layout');
        layout.set('left', 0);
        layout.set('height', height);
        layout.set('right', 0);
        layout.set('top', top);
        layout.set('bottom', bottom);

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

Flame.LazyListViewStates = {};

Flame.LazyListViewStates.MouseIsDown = Flame.State.extend({
    xOffset: null,
    yOffset: null,

    exitState: function() { this.xOffset = this.yOffset = null; },

    mouseMove: function(event) {
        var owner = this.get('owner');
        if (!owner.getPath('parentView.allowReordering')) return true;
        // Only start dragging if we move more than 2 pixels vertically
        if (this.xOffset === null) { this.xOffset = event.pageX; this.yOffset = event.pageY; }
        if (Math.abs(event.pageY - this.yOffset) < 3) return true;

        var offset = owner.$().offset();
        this.setPath('owner.xOffset', this.xOffset - offset.left);
        this.setPath('owner.yOffset', this.yOffset - offset.top);
        this.gotoState('dragging');
        return true;
    },

    mouseUp: function() {
        var owner = this.get('owner');
        var parentView = owner.get('parentView');
        parentView.selectIndex(owner.get('contentIndex'));
        this.gotoState('idle');
        return true;
    }
});

Flame.LazyListItemView = Flame.ListItemView.extend(Flame.Statechart, {
    layout: { left: 0, right: 0, height: 25 },
    initialState: 'idle',

    init: function() {
        this._super();
        // Don't rerender the item view when the content changes
        this.set('displayProperties', []);
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
            this.gotoState('mouseIsDown');
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
            var listViewElement = listView.$();
            this.setPath('owner.isDragged', true);
            this.scrollViewOffset = listView.get('parentView').$().offset();
            this.clone = this.get('owner').$().safeClone();
            this.clone.addClass('dragged-clone');
            this.clone.draggingInfo = { currentIndex: this.getPath('owner.contentIndex') };
            this.indicator = jQuery('<div class="indicator"><img src="%@"></div>'.fmt(Flame.image('reorder_indicator.png'))).hide();
            listViewElement.append(this.clone);
            listViewElement.append(this.indicator);
        },

        exitState: function() {
            this.setPath('owner.isDragged', false);
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
            this.gotoState('idle');
            return true;
        },

        didDragItem: function(newTop, newLeft) {
            if (this.getPath('owner.parentView.constrainDragginToXAxis')) {
                this.clone.css({top: newTop});
            } else {
                this.clone.css({top: newTop, left: newLeft});
            }
            var itemHeight = this.getPath('owner.parentView.itemHeight');
            var index = Math.ceil(newTop / itemHeight);
            this.clone.draggingInfo = this.getPath('owner.parentView').indexForMovedItem(this.clone.draggingInfo, index, this.getPath('owner.contentIndex'));
            var height = this.clone.draggingInfo.currentIndex * itemHeight;
            this.indicator.css({top: height - 1 + 'px'});
            this.indicator.show();
        },

        finishDragging: function() {
            this.getPath('owner.parentView').moveItem(this.getPath('owner.contentIndex'), this.clone.draggingInfo);
        }
    })
});
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

        if (element.attr('id')) clone.attr('id', element.attr('id')+"_drag");
        clone.addClass('is-dragged-clone');
        clone.find("*").each(function() {
            if (this.id) this.id = this.id + "_drag";
        });
        clone.appendTo(this.get('listView').$());

        clone.css('opacity', 0.8);

        this.set('clone', clone);
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
    updateDisplay: function(evt, scheduled) {
        // This logic discards mouseMove events scheduled by the scrolling logic in case there's been a real mouseMove event since scheduled
        if (scheduled === undefined) this.mouseMoveCounter++;
        else if (scheduled < this.mouseMoveCounter) return false;

        this._updateDraggingCloneAndScrollPosition(evt);
        var newPath = this._resolveNewPath(evt.pageX, evt.pageY);

        if (newPath && !this.itemPath.equals(newPath)) {
            var view = this.itemPath.getView();
            this._moveItem(this.itemPath, newPath);
            this.itemPath = this._resolvePath(view);
            this._updateCss();
            this.lastPageX = evt.pageX;  // Reset the reference point for horizontal movement every time the item is moved
        }

        return true;
    },

    finishReorder: function() {
        var itemPathView = this.itemPath.getView();
        this.get('listView').didReorderContent(itemPathView.getPath('parentView.content'));
        itemPathView.set("isDragged", false);
        this.clone.remove();  // Remove the clone holding the clones from the DOM
    },

    // Updates the css classes and 'left' property of the clone and its children, needed for fixing indentation
    // to match the current item position in a tree view.
    _updateCss: function() {
        var draggedElement = this.itemPath.getView().$();
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
    },

    // Moves the dragged element in the list/tree to a new location, possibly under a new parent
    _moveItem: function(sourcePath, targetPath) {
        var view = sourcePath.getView();
        var contentItem = view.get('content');
        var sourceParent = view.get('parentView');
        var sourceContent = sourceParent.get('content');
        var element = view.$();

        var targetView = targetPath.getView();
        var targetElement = targetView.$();
        var targetParent = targetPath.position === 'i' ? targetPath.getNestedListView() : targetView.get('parentView');
        var targetContent = targetParent.get('content');
        var targetChildViews = targetParent.get('childViews');

        // First remove the view, the content item and the DOM element from their current parent.
        // If moving inside the same parent, use a special startMoving+endMoving API provided by
        // Flame.SortingArrayProxy to protect against non-modifiable arrays (the sort property is
        // still updated).
        if (sourceContent === targetContent && sourceContent.startMoving) sourceContent.startMoving();
        sourceParent.get('childViews').removeObject(view);
        sourceContent.removeObject(contentItem);
        sourceParent._updateContentIndexes();
        element.detach();

        // Then insert them under the new parent, at the correct position
        var targetIndex = targetView.get('contentIndex');
        if (targetPath.position === 'b') {
            element.insertBefore(targetElement);
            targetChildViews.insertAt(targetIndex, view);
            targetContent.insertAt(targetIndex, contentItem);
        } else if (targetPath.position === 'a') {
            element.insertAfter(targetElement);
            targetChildViews.insertAt(targetIndex+1, view);
            targetContent.insertAt(targetIndex+1, contentItem);
        } else if (targetPath.position === 'i') {
            targetElement.find('.flame-list-view').first().prepend(element);
            targetChildViews.insertAt(0, view);
            targetContent.insertAt(0, contentItem);
        } else throw 'Invalid insert position ' + targetPath.position;

        if (sourceContent === targetContent && sourceContent.endMoving) sourceContent.endMoving();
        // We need to do this manually because ListView suppresses the childViews observers while dragging,
        // so that we can do the entire DOM manipulation ourselves here without the list view interfering.
        view.set('_parentView', targetParent);
        targetParent._updateContentIndexes();
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
        Ember.assert('Start element not found', startIndex >= 0);

        var cloneTop = this.clone.offset().top;
        var cloneBottom = cloneTop + this.clone.outerHeight();
        var currentDy = cloneTop - draggedElement.offset().top;

        var direction = currentDy > 0 ? 1 : -1;  // Is user dragging the item up or down from its current position in the list?
        var i = startIndex + direction;
        var len = itemElements.length;
        var newIndex = startIndex;

        //console.log('startIndex %s, currentDy %s, len %s, i %s', startIndex, currentDy, len, i);
        while (i >= 0 && i < len) {
            var testElement = jQuery(itemElements[i]);
            if (testElement.closest('.is-dragged-clone').length > 0) break;  // Ignore the clone
            if (testElement.is(':visible') && testElement.closest(draggedElement).length === 0) {
                var thresholdY = testElement.offset().top + testElement.outerHeight() * (0.5 + direction * 0.2);
                //console.log('cloneTop %s, cloneBottom %s, i %s, test top %s, thresholdY', cloneTop, cloneBottom, i, testElement.offset().top, thresholdY);

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
               path.array.length > 1 && targetView.get('contentIndex') === targetView.getPath('parentView.childViews.length') - 1) {
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
        }  else {
            var newParentItemView = targetPath.up().getView();
            if (newParentItemView) {
                newParent = newParentItemView.get('content');
            }
        }
        var isValid = this.get('listView').isValidDrop(itemDragged, newParent, dropTarget);
        return !isValid;
    },

    _getPrecedingView: function(view) {
        return view.get('contentIndex') > 0 ? view.getPath('parentView.childViews').objectAt(view.get('contentIndex') - 1) : undefined;
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

    _updateDraggingCloneAndScrollPosition: function(evt) {
        var domParent = this.get('listView').$();
        if (domParent.hasClass('is-nested')) domParent = domParent.offsetParent();  // If nested list in a tree, grab the topmost
        var scrollTop = domParent.scrollTop();
        var parentHeight = domParent.innerHeight();
        var newTop = evt.pageY - this.yOffset - domParent.offset().top + scrollTop;

        // Check top and bottom limits to disallow moving beyond the content area of the list view
        if (newTop < 0) newTop = 0;
        var height = this.clone.outerHeight();
        var scrollHeight = domParent[0].scrollHeight;  // See http://www.yelotofu.com/2008/10/jquery-how-to-tell-if-youre-scroll-to-bottom/
        if (newTop + height > scrollHeight) newTop = scrollHeight - height;

        this.clone.css({position: 'absolute', right: 0, top: newTop});

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
                var currentCounter = this.mouseMoveCounter;
                Ember.run.next(this, function() { this.updateDisplay(evt, currentCounter); });
            }
        }
    }
});

/*
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
            view = listView.get('childViews').objectAt(index);
            if (i < len - 1) {
                listView = view.get('childListView');
            }
        }
        return view;
    },

    getNestedListView: function() {
        return this.getView().get("childListView");
    },

    up: function() {
        var newArray = this.array.slice(0, this.array.length - 1);
        return Flame.ListViewDragHelper.Path.create({array: newArray, position: 'a', root: this.root});
    },

    down: function() {
        var newArray = Ember.copy(this.array);
        var newPosition;
        var nestedChildrenCount = this.getNestedListView().getPath('content.length');
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
    initialState: 'idle',
    reorderDelegate: null,
    init: function() {
        this._super();
        this._selectionDidChange();
    },

    itemViewClass: Flame.ListItemView.extend({
        templateContext: function(key, value) {
            return value !== undefined ? value : Ember.get(this, 'content');
        }.property('content').cacheable(),
        templateBinding: "parentView.template",
        handlebars: "{{title}}"
    }),

    selectIndex: function(index) {
        if (!this.get('allowSelection')) return false;
        var content = this.get('content');
        if (content) {
            var childView = this.get('childViews').objectAt(index);
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
                var child = this.get('childViews').objectAt(index);
                if (child) child.set('isSelected', status);
            }
        }
    },

    // If items are removed or reordered, we must update the contentIndex of each childView to reflect their current position in the list
    _updateContentIndexes: function() {
        var childViews = this.get('childViews');
        var len = childViews.get('length');
        for (var i = 0; i < len; i++) {
            var childView = childViews.objectAt(i);
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
    }.property(),

    arrayWillChange: function(content, start, removedCount) {
        if (!this.getPath('rootTreeView.isDragging')) {
            return this._super.apply(this, arguments);
        }
    },

    arrayDidChange: function(content, start, removed, added) {
        if (!this.getPath('rootTreeView.isDragging')) {
            var result = this._super.apply(this, arguments);
            this._updateContentIndexes();
            return result;
        }
    },

    childViewsWillChange: function() {
        if (!this.getPath('rootTreeView.isDragging')) {
            return this._super.apply(this, arguments);
        }
    },

    childViewsDidChange: function() {
        if (!this.getPath('rootTreeView.isDragging')) {
            return this._super.apply(this, arguments);
        }
    },

    // Override if needed, return false to disallow reordering that particular item
    allowReorderingItem: function(itemIndex) {
        return true;
    },

    idle: Flame.State.extend({
        moveUp: function() { return this.get('owner').changeSelection(-1); },
        moveDown: function() { return this.get('owner').changeSelection(1); },

        mouseDownOnItem: function(itemIndex, evt) {
            var owner = this.get('owner');
            owner.selectIndex(itemIndex);

            // Store some information in case user starts dragging (i.e. moves mouse with the button pressed down),
            // but only if reordering is generally allowed for this list view and for the particular item
            if (owner.get('allowReordering') && itemIndex !== undefined) {
                if (owner.allowReorderingItem(itemIndex)) {
                    //console.log('Drag started on %s, dragging %s items', itemIndex, itemCount);
                    var childView = owner.get('childViews').objectAt(itemIndex);
                    owner.set('dragHelper', Flame.ListViewDragHelper.create({
                        listView: owner,
                        lastPageX: evt.pageX,
                        yOffset: evt.pageY - childView.$().offset().top,
                        itemPath: [itemIndex]
                    }));
                }
            }

            this.gotoState('mouseButtonPressed');

            // Have to always return true here because the user might start dragging, and if so, we need the mouseMove events.
            return true;
        },

        enterState: function() {
            this.get('owner').set('dragHelper', undefined);  // In case dragging was allowed but not started, clear the drag data
        }
    }),

    // This is here so that we can override the behaviour in tree views
    startReordering: function(dragHelper, event) {
        dragHelper.set('listView', this);
        this.set('dragHelper', dragHelper);
        this.gotoState('reordering');
        return this.mouseMove(event);  // Handle also this event in the new state
    },

    mouseButtonPressed: Flame.State.extend({
        mouseUpOnItem: Flame.State.gotoHandler('idle'),
        mouseUp: Flame.State.gotoHandler('idle'),

        mouseMove: function(event) {
            var owner = this.get('owner');
            if (owner.get('dragHelper')) {  // Only enter reordering state if it was allowed, indicated by the presence of dragHelper
                var dragHelper = owner.get('dragHelper');
                this.gotoState('idle');
                owner.startReordering(dragHelper, event);
            }
            return true;
        },

        touchEnd: Flame.State.gotoHandler('idle'),

        touchMove: function(event) {
            this.mouseMove(this.normalizeTouchEvents(event));
            return true;
        }
    }),

    reordering: Flame.State.extend({
        mouseMove: function(evt, view, scheduled) {
            return this.get('owner').get('dragHelper').updateDisplay(evt);
        },

        mouseUp: Flame.State.gotoHandler('idle'),

        touchMove: function(event) {
            this.mouseMove(this.normalizeTouchEvents(event));
            return true;
        },

        touchEnd: Flame.State.gotoHandler('idle'),

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
        this.forEachChildView(function(view) {
            if (typeof view.get('contentIndex') !== 'undefined') {
                this._recycleView(view);
            }
        });
        this.numberOfRowsChanged();
        this.didScroll(this._lastScrollHeight, this._lastScrollTop);
    },

    // Some browsers reset the scroll position when the `block` CSS property has
    // changed without firing a scroll event.
    becameVisible: function() {
        var scrollView = this.nearestInstanceOf(Flame.ScrollView);
        if (scrollView && scrollView.get('element')) {
            var element = scrollView.get('element');
            this._lastScrollHeight = element.offsetHeight;
            this._lastScrollTop = element.scrollTop;
            this.didScroll(this._lastScrollHeight, this._lastScrollTop);
        }
    },

    willDestroyElement: function() {
        this.forEachChildView(function(view) {
            if (typeof view.get('contentIndex') !== 'undefined') {
                this._recycleView(view);
            }
        });
    },

    numberOfRowsChanged: function() {
        this.adjustLayout('height', this.numberOfRows() * this.get('itemHeight'));
        // In case the LazyListView has `useAbsolutePosition` set to false, `adjustLayout` will not work
        // and we need to set the height manually.
        this.$().css('height', this.numberOfRows() * this.get('itemHeight') + 'px');
    },

    numberOfRows: function() {
        return this.getPath('content.length');
    },

    didScroll: function(scrollHeight, scrollTop) {
        this._lastScrollHeight = scrollHeight;
        this._lastScrollTop = scrollTop;

        var range = this._rowsToRenderRange(scrollHeight, scrollTop);
        var min = range.end, max = range.start;
        this.forEachChildView(function(view) {
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
        });

        // Fill up empty gap on top
        var i;
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
        var offsetFromParent = this.getPath('parentView.element').scrollTop + this.$().position().top;
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
        var view = (this._recycledViews[itemClass] && this._recycledViews[itemClass].pop());
        if (!view) {
            view = this.createChildView(viewClass, jQuery.extend({ useAbsolutePosition: true }, attributes || {}));
            this.get('childViews').pushObject(view);
        }
        if (item === this.get('selection')) {
            view.set('isSelected', true);
        }
        view.set('content', item);
        view.set('contentIndex', row);
        view.adjustLayout('top', row * itemHeight);
        view.set('isVisible', true);
        return view;
    },

    /** Prepare a view to be recycled at a later point */
    _recycleView: function(view) {
        view.set('isVisible', false);
        view.set('contentIndex', undefined);
        view.set('isSelected', false);
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
        throw 'Not implemented yet!';
    },

    childViewForIndex: function(index) {
        return this.get('childViews').findProperty('contentIndex', index);
    }
});

Flame.LazyTreeItemView = Flame.LazyListItemView.extend({
    classNames: ['flame-tree-item-view'],
    itemContent: '{{content}}',
    isExpanded: false,

    collapsedImage: Flame.image('disclosure_triangle_left.png'),
    expandedImage: Flame.image('disclosure_triangle_down.png'),

    handlebars: function() {
        return '{{{unbound disclosureImage}}} <span>' + this.get('itemContent') + '</span>';
    }.property('itemContent').cacheable(),

    isExpandedDidChange: function() {
        this.$().find('img').first().replaceWith(this.get('disclosureImage'));
    }.observes('isExpanded'),

    isExpandable: function() {
        return this.get('parentView').isExpandable(this.get('content'));
    },

    disclosureImage: function() {
        var isExpandable = this.isExpandable();
        if (!isExpandable) return '';
        return '<img src="%@">'.fmt(this.get('isExpanded') ? this.get('expandedImage') : this.get('collapsedImage'));
    }.property('isExpanded', 'content', 'expandedImage', 'collapsedImage').cacheable(),

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



/**
  The tree in the `LazyTreeView` is being rendered as a flat list, with items
  being indented to give the impression of a tree structure.
  We keep a number of internal caches to easily map this flat list onto the
  tree we're rendering.

  TODO * `LazyTreeView` currently has the limitation that it does not allow
         dragging items between different levels.

  @class LazyTreeView
  @extends LazyListView
*/

Flame.LazyTreeView = Flame.LazyListView.extend({
    classNames: 'flame-tree-view flame-lazy-tree-view'.w(),
    itemViewClass: Flame.LazyTreeItemView,

    init: function() {
        this._super();
        this._rowToItemCache = [];
        this._itemToRowCache = new Hashtable();
        this._itemToLevelCache = new Hashtable();
        this._itemToParentCache = new Hashtable();
        this._expandedItems = [];
        this._numberOfCachedRows = 0;
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
        this._itemToRowCache.put(item, this._numberOfCachedRows);
        this._itemToLevelCache.put(item, level);
        if (parent) this._itemToParentCache.put(item, parent);

        this._numberOfCachedRows++;

        // If an item is not expanded, we don't care about its children
        if (this._expandedItems.indexOf(item) === -1) return;
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
        var itemViewClasses = this.get('itemViewClasses');
        return itemViewClasses[item.constructor.toString()];
    },

    itemForRow: function(row) {
        return this._rowToItemCache[row];
    },

    rowForItem: function(item) {
        return this._itemToRowCache.get(item);
    },

    levelForItem: function(item) {
        return this._itemToLevelCache.get(item);
    },

    /** The tree view needs to additionally set the correct indentation level */
    viewForRow: function(row) {
        var item = this.itemForRow(row);
        var isExpanded = this._expandedItems.indexOf(item) !== -1;
        var view = this._super(row, { isExpanded: isExpanded });
        view.set('isExpanded', isExpanded);
        var classNames = view.get('classNames');
        var level = 'level-' + (this._itemToLevelCache.get(item) + 1);
        // Check if we already have the correct indentation level
        if (classNames.indexOf(level) === -1) {
            // Remove old indentation level
            classNames.forEach(function(className) {
                if (/^level/.test(className)) {
                    classNames.removeObject(className);
                }
            });
            // Set correct indentation level
            classNames.pushObject(level);
        }
        return view;
    },

    _invalidateRowCache: function() {
        this._rowToItemCache = [];
        if (this._itemToRowCache) this._itemToRowCache.clear();
        if (this._itemToLevelCache) this._itemToLevelCache.clear();
        if (this._itemToParentCache) this._itemToParentCache.clear();
        this._numberOfCachedRows = 0;
    },

    isExpandable: function(item) {
        return true;
    },

    expandItem: function(item) {
        this._expandedItems.pushObject(item);
        var row = this.rowForItem(item);
        var view = this.childViewForIndex(row);
        if (view && !view.get('isExpanded')) {
            view.set('isExpanded', true);
            this.toggleItem(view);
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
    toggleItem: function(view) {
        var item = view.get('content');
        var isExpanded = view.get('isExpanded');
        if (isExpanded) {
            this._expandedItems.pushObject(item);
        } else {
            this._expandedItems.removeObject(item);
        }
        this.numberOfRowsChanged();

        // Update rendering
        var toRemove = [];
        var indices = [];
        var range = this._rowsToRenderRange(this._lastScrollHeight, this._lastScrollTop);
        this.forEachChildView(function(view) {
            var contentIndex = view.get('contentIndex');
            var content = view.get('content');
            var row = this.rowForItem(content);
            if (row === null) {
                toRemove.push(view);
            } else if (typeof contentIndex !== 'undefined') {
                indices.push(row);
                if (contentIndex != row) {
                    view.set('contentIndex', row);
                    var itemHeight = this.itemHeightForRow(row);
                    view.$().css('top', row * itemHeight + 'px');
                }
                if (row < range.start || row > range.end) {
                    this._recycleView(view);
                }
            }
        });

        // Remove views that were used to render a subtree that is now collapsed
        toRemove.forEach(function(view) { view.destroy(); });

        // Render missing views
        for (var i = range.start; i <= range.end; i++) {
            if (indices.indexOf(i) === -1) {
                view = this.viewForRow(i);
                var itemHeight = this.itemHeightForRow(i);
                view.adjustLayout('top', i * itemHeight);
            }
        }
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
                if (this._expandedItems.indexOf(selection) === -1) {
                    this._expandedItems.pushObject(selection);
                } else {
                    this._expandedItems.removeObject(selection);
                }
                return true;
            }
        }
        return false;
    },

    closestCommonAncestor: function(item1, item2) {
        var ancestor = this._itemToParentCache.get(item1);
        var parent = this._itemToParentCache.get(item2);
        while (parent) {
            if (parent === ancestor) {
                return parent;
            } else {
                parent = this._itemToParentCache.get(parent);
            }
        }
    },

    isValidDrop: function(item, dropParent) {
        return true;
    },

    /**
      @param {Object} draggingInfo
      @param {Number} proposedIndex
      @param {Number} originalIndex
    */
    indexForMovedItem: function(draggingInfo, proposedIndex, originalIndex) {
        // Get items of interest
        var itemFrom = this.itemForRow(originalIndex);
        var itemAbove = this.itemForRow(proposedIndex - 1);
        var itemBelow = this.itemForRow(proposedIndex);

        // Bounds checking
        if (proposedIndex < 0) proposedIndex = 0;
        if (proposedIndex > this.numberOfRows()) proposedIndex = this.numberOfRows();

        // Only allow moving between the same level
        var itemLevel = this.levelForItem(itemFrom);
        var acceptedIndex,
            toParent,
            toPosition;
        if (itemBelow && this.levelForItem(itemBelow) === itemLevel) {
            acceptedIndex = proposedIndex;
            toParent = this._itemToParentCache.get(itemBelow);
            toPosition = (toParent && toParent.get('treeItemChildren') || this.get('content')).indexOf(itemBelow);
        } else if (itemAbove && this.levelForItem(itemAbove) === itemLevel && this._expandedItems.indexOf(itemAbove) === -1) {
            acceptedIndex = proposedIndex;
            toParent = this._itemToParentCache.get(itemAbove);
            toPosition = toParent ? toParent.getPath('treeItemChildren.length') : this.getPath('content.length');
        } else if ((!itemBelow || (itemBelow && this.levelForItem(itemBelow) < itemLevel)) &&
                   itemAbove && this.levelForItem(itemAbove) > itemLevel) {
            acceptedIndex = proposedIndex;
            toParent = this.closestCommonAncestor(itemFrom, itemAbove);
            toPosition = toParent ? toParent.getPath('treeItemChildren.length') : this.getPath('content.length');
        } else if (itemAbove && itemLevel - 1 === this.levelForItem(itemAbove) && this._expandedItems.indexOf(itemAbove) !== -1) {
            // Dragging into parent item that is currently empty and open
            acceptedIndex = proposedIndex;
            toParent = itemAbove;
            toPosition = 0;
        } else {
            return draggingInfo;
        }

        if (!this.isValidDrop(itemFrom, toParent)) return draggingInfo;

        return  { currentIndex: acceptedIndex, toParent: toParent, toPosition: toPosition };
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
                view.$().animate({top: view.get('contentIndex') * itemHeight + 'px'});
            }
        });
        if (direction < 0) to--;
        movedView.set('contentIndex', to);
        movedView.$().animate({top: to * itemHeight + 'px'});

        if (direction < 0) to++;
        var fromItem = this.itemForRow(from);
        var fromParent = this._itemToParentCache.get(fromItem);
        var toParent = draggingInfo.toParent || fromParent;

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
        if (delegate) {
            Ember.run.next(this, function() {
                delegate.didReorderContent(toContent);
            });
        }
    }
});
Flame.LoadingIndicatorView = Flame.ImageView.extend({
    layout: { width: 16, height: 16 },
    classNames: ['loading-indicator'],
    value: Flame.image('loading.gif')
});

/**
  Flame.Popover provides a means to display a popup in the context of an existing element in the UI.
*/

Flame.Popover = Flame.Panel.extend({
    classNames: ['flame-popover'],
    childViews: [],
    dimBackground: false,
    arrow: 'arrow', // How to use a string literal in bindAttr?
    handlebars: '<img {{bindAttr class="arrowPosition arrow"}} {{bindAttr src="image"}} />{{view contentView}}',
    anchor: null,
    position: null,

    _positionArrow: function() {
        var anchor = this.get('anchor');
        var position = this.get('position');
        var arrow = this.$('img.arrow');
        var offset = anchor.offset();
        var arrowOffset;
        if (position & (Flame.POSITION_ABOVE | Flame.POSITION_BELOW)) {
            arrowOffset = offset.left + (anchor.outerWidth() / 2) - (!this.$().css('left') ? 0 : parseInt(this.$().css('left').replace('px', ''), 10)) - 15;
            arrow.css({ left: arrowOffset + 'px' });
            if (position & Flame.POSITION_ABOVE) {
                arrow.css({ top: this.getPath('layout.height') - 1 + 'px' });
            }
        } else {
            arrowOffset = offset.top + (anchor.outerHeight() / 2) - parseInt(this.$().css('top').replace('px', ''), 10) - 15;
            arrow.css({ top: arrowOffset + 'px' });
            if (position & Flame.POSITION_LEFT) {
                arrow.css({ left: this.getPath('layout.width') - 1 + 'px' });
            }
        }
    },

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
            this.set('image', Flame.image('arrow_down.png'));
        } else if (position & Flame.POSITION_BELOW) {
            layout.top += 15;
            this.set('arrowPosition', 'below');
            this.set('image', Flame.image('arrow_up.png'));
        } else if (position & Flame.POSITION_LEFT) {
            layout.left -= 15;
            this.set('arrowPosition', 'left');
            this.set('image', Flame.image('arrow_right.png'));
        } else if (position & Flame.POSITION_RIGHT) {
            layout.left += 15;
            this.set('arrowPosition', 'right');
            this.set('image', Flame.image('arrow_left.png'));
        }
        return layout;
    },

    didInsertElement: function() {
        this._positionArrow();
    },

    popup: function(anchor, position) {
        Ember.assert('Flame.Popover.popup requires an anchor', !!anchor);
        Ember.assert('Flame.Popover.popup requires a position', !!position);
        this._super(anchor, position | Flame.POSITION_MIDDLE);
    }
});
Flame.ProgressView = Flame.View.extend({
    classNames: ['flame-progress-view'],
    animate: false,

    handlebars: function() {
        var height = this.get('layout').height;
        return "<div style='height: %@px;' class='progress-container'></div><div style='height: %@px; width: %@px;' class='progress-bar'></div>".fmt(height - 2, height - 4, this.get('size'));
    }.property().cacheable(),

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

    _sizeDidChange: function() {
        // In CubeTableLoadingView, the progress views are rendered before the value & maximum bindings have synchronized,
        // which means the handlebars template uses width 0. Then they synchronize _before_ the element is added to DOM,
        // which means $(...) doesn't work yet. Defer updating to next runloop.
        Ember.run.next(this, function() {
            if (this.get('animate')) {
                this.$('.progress-bar').animate({ width: this.get('size') }, 300);
            } else {
                this.$('.progress-bar').css('width', this.get('size'));
            }
        });
    }.observes('size')
});
Flame.RadioButtonView = Flame.CheckboxView.extend({
    classNames: ['flame-radio-button-view'],

    action: function() {
        this.set('targetValue', this.get('value'));
    },

    isSelected: function() {
        if (Ember.typeOf(this.get('value')) === 'undefined' || Ember.typeOf(this.get('targetValue')) === 'undefined') {
            return false;
        }
        return this.get('value') === this.get('targetValue');
    }.property('targetValue', 'value').cacheable(),

    renderCheckMark: function(context) {
        context.push("<div class='flame-view flame-checkbox-checkmark' style='top:8px;left:8px;width:6px;height:6px;'></div>");
    }
});
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
    classNames: 'scroll-view'.w(),
    /** Last known vertical scroll offset */
    lastScrollY: 0,
    /** Is the ScrollView currently being scrolled? */
    isScrolling: false,

    didInsertElement: function() {
        this._super();
        this.$().scroll(jQuery.proxy(this.didScroll, this));
        this._update();
    },

    didScroll: function(event) {
        this.set('lastScrollY', this.get('element').scrollTop);
        if (!this.get('isScrolling')) {
            requestAnimationFrame(jQuery.proxy(this._update, this));
        }
        this.set('isScrolling', true);
    },

    _update: function() {
        var height = this.get('element').offsetHeight;
        var scrollTop = this.get('lastScrollY');
        this.set('isScrolling', false);
        // Notify childViews the scrollview has scrolled
        this.forEachChildView(function(view) {
            if (view.didScroll) view.didScroll(height, scrollTop);
        });
    }
});

Flame.SearchTextFieldView = Flame.TextFieldView.extend({
    classNames: ['flame-search-field'],

    cancel: function() {
        if (Ember.empty(this.get('value'))) {
            // Nothing to clear, we don't handle the event
            return false;
        } else {
            // I don't know why, but for this to work in Firefox we need to run
            // it in the next run loop.
            Ember.run.next(this, function() {
                this.set('value', '');
            });
            return true;
        }
    }
});


Flame.StackItemView = Flame.ListItemView.extend({
    useAbsolutePosition: true,
    classNames: ['flame-stack-item-view']
});
// Stack view is a list view that grows with the content and uses absolute positioning for the child views.
// Use class StackItemView as the superclass for the item views.
Flame.StackView = Flame.ListView.extend({
    layoutManager: Flame.VerticalStackLayoutManager.create({ topMargin: 0, spacing: 0, bottomMargin: 0 }),
    allowSelection: false
});
Flame.TabView = Flame.View.extend({
    classNames: ['flame-tab-view'],
    childViews: 'tabBarView contentView'.w(),
    tabs: null,
    previousTabs: null,
    nowShowing: null,
    tabsHeight: 23,
    initializeTabsLazily: true,

    init: function() {
        this._super();
        //if tabs not set via binding, we need to build the tabs here
        if (!Ember.none(this.get('tabs'))) {
            this._tabsDidChange();
        }
    },

    _tabsWillChange: function() {
        var tabs = this.get('tabs');
        if (!Ember.none(tabs)) {
            this.set('previousTabs', tabs.slice());
        }
    }.observesBefore('tabs.@each'),

    _tabsDidChange: function() {
        var tabs = this.get('tabs');
        if (Ember.none(tabs)) {
            return;
        }
        var previousTabs = this.get('previousTabs');

        if (!Ember.none(previousTabs)) {
            previousTabs.forEach(function(tab, i) {
                if (Ember.none(tabs.findProperty('value', tab.value))) {
                    var tabBarView = this.get('tabBarView');
                    tabBarView.get('childViews').forEach(function(tabView) {
                        if (tabView.get('value') === tab.value) tabBarView.removeChild(tabView);
                    });
                }
            }, this);
        }

        tabs.forEach(function(tab, i) {
            if (Ember.none(previousTabs) || Ember.none(previousTabs.findProperty('value', tab.value))) {
                this._addTab(tab, i);
            }
        }, this);
    }.observes('tabs.@each'),

    _addTab: function(tab, index) {
          var contentView = this.get('contentView');
          var contentViewChildren = contentView.get('childViews');
          var tabBarView = this.get('tabBarView');
          var tabBarViewChildren = tabBarView.get('childViews');
          var tabsHeight = this.get('tabsHeight');
          var self = this;
          tabBarViewChildren.insertAt(index, tabBarView.createChildView(Flame.ButtonView.create({
              acceptsKeyResponder: false,
              layout: { top: 0, bottom: 0, height: tabsHeight },
              title: tab.title,
              value: tab.value,
              isSelected: Flame.computed.equals('parentView.parentView.nowShowing', tab.value),
              action: function() {
                  self.set('nowShowing', tab.value);
              }
          })));
          var view = self.get(tab.value);
          Ember.assert('View for tab %@ not defined!'.fmt(tab.value), !!view);
          if (!self.get('initializeTabsLazily')) {
              if (!(view instanceof Ember.View)) {
                  view = contentView.createChildView(view);
              }
              view.set('isVisible', false);
              contentViewChildren.addObject(view);
              self.set(tab.value, view);
          }

          if (Ember.none(this.get('nowShowing'))) this.set('nowShowing', this.get('tabs').objectAt(0).value);
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
                contentView.get('childViews').addObject(view);
                this.set(nowShowing, view);
            }
            view.set('isVisible', true);
        }
    }.observes('nowShowing'),

    tabBarView: Flame.View.extend({
        classNames: ['flame-tab-view-tabs'],
        layout: { left: 0, top: 0, right: 0, height: 'parentView.tabsHeight' }
    }),

    contentView: Flame.View.extend({
        classNames: ['flame-tab-view-content'],
        layout: { left: 0, top: 'parentView.tabsHeight', right: 0, bottom: 0 }
    })

});
Flame.TableDataView = Flame.View.extend(Flame.Statechart, {
    classNames: ['flame-table-data-view'],
    acceptsKeyResponder: true,
    batchUpdates: true,
    updateBatchSize: 500,
    _updateCounter: 0,
    selectedCell: null,
    editValue: null,
    contentBinding: '^content',

    initialState: 'loaded',

    loaded: Flame.State.extend({
        mouseDown: function(event) {
            var owner = this.get('owner');
            if (owner.selectCell(owner._cellForTarget(event.target))) {
                this.gotoState('selected');
                return true;
            } else { return false; }
        },

        enterState: function() {
            if (this.getPath('owner.state') === 'inDOM') {
                this.getPath('owner.selection').hide();
            }
        }
    }),

    selected: Flame.State.extend({
        mouseDown: function(event) {
            var owner = this.get('owner');
            // If a cell is clicked that was already selected and it's a cell
            // with fixed options, start editing it.
            var selectedDataCell = owner.get('selectedDataCell');
            if (jQuery(event.target).hasClass('table-selection-background') && selectedDataCell.options && selectedDataCell.options()) {
                this.startEdit();
                return true;
            }

            var target = owner._cellForTarget(event.target);
            return !!owner.selectCell(target);
        },

        mouseUp: function(event) {
            var tableViewDelegate = this.getPath('owner.tableViewDelegate');
            if (tableViewDelegate && tableViewDelegate.mouseUp) {
                var target = jQuery(event.target);
                var targetDataCell;
                var index;
                var columnIndexCell = target.closest('[data-index]');
                var columnIndex = columnIndexCell.attr('data-index');
                var rowIndex = columnIndexCell.parent().attr('data-index');

                if (columnIndex && rowIndex) {
                    targetDataCell = this.getPath('owner.data')[rowIndex][columnIndex];
                    index = [rowIndex, columnIndex];
                    tableViewDelegate.mouseUp(event, target, targetDataCell, index, this.get('owner'));
                }
            }
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
        },

        wipeCell: function() {
            var dataCell = this.getPath('owner.selectedDataCell');
            if (Ember.none(dataCell)) {
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
            var dataCell = this.getPath('owner.selectedDataCell');
            if (Ember.none(dataCell)) {
                return;
            }
            if (dataCell.isEditable()) {
                this.gotoState('editing');
            } else if (!dataCell.options()) {
                this.gotoState('selectingReadOnly');
            }
        },

        cancel: function(event) {
            this.get('owner').resignKeyResponder();
            return true;
        },

        moveLeft: function(event) {
            var selectedCell = this.getPath('owner.selectedCell');
            this.get('owner').selectCell(selectedCell.prev());
            return true;
        },

        moveRight: function(event) {
            var selectedCell = this.getPath('owner.selectedCell');
            this.get('owner').selectCell(selectedCell.next());
            return true;
        },

        moveDown: function(event) {
            var selectedCell = this.getPath('owner.selectedCell');
            this.get('owner').selectCell(jQuery(selectedCell.parent().next().children()[selectedCell.attr('data-index')]));
            return true;
        },

        moveUp: function(event) {
            var selectedCell = this.getPath('owner.selectedCell');
            this.get('owner').selectCell(jQuery(selectedCell.parent().prev().children()[selectedCell.attr('data-index')]));
            return true;
        },

        insertTab: function(event) {
            this.get('owner').invokeStateMethodByValuesOn('moveDown', 'moveRight');
            return true;
        },

        insertBacktab: function(event) {
            this.get('owner').invokeStateMethodByValuesOn('moveUp', 'moveLeft');
            return true;
        },

        // We need to use the keyPress event, as some browsers don't report the character pressed correctly with keyDown
        keyPress: function(event) {
            var dataCell = this.getPath('owner.selectedDataCell');
            if (Ember.none(dataCell) || (dataCell && !dataCell.isEditable())) {
                return false;
            }
            var key = String.fromCharCode(event.which);
            if (event.metaKey) { return false; }
            if (key.match(/[a-zA-Z0-9+*\-\[\/\=]/)) {
                var owner = this.get('owner');
                owner.set('editValue', key);
                this.startEdit();
                return true;
            }
            return false;
        },

        enterState: function() {
            this.getPath('owner.selection').show();
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
            this.gotoState('selected');
            owner.invokeStateMethodByValuesOn('moveRight', 'moveDown');
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
            this.gotoState('selected');
            return true;
        },

        mouseDown: function(event) {
            var owner = this.get('owner');
            var cell = owner._cellForTarget(event.target);
            if (owner.isCellSelectable(cell)) {
                this.gotoState('selected');
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
            var readOnlyValue = owner.editableValue(dataCell, true);
            selection.html(readOnlyValue);
            selection.addClass('read-only is-selectable');
        },

        exitState: function() {
            var selection = this.getPath('owner.selection');
            selection.html('<div class="table-selection-background"></div>');
            selection.removeClass('read-only is-selectable');
        },

        _invokeInSelected: function(action) {
            var owner = this.get('owner');
            this.gotoState('selected');
            owner.invokeStateMethod(action);
        }
    }),

    editing: Flame.State.extend({
        cancel: function(event) {
            this.get('owner')._cancelEditingOrSelecting();
            return true;
        },

        insertNewline: function(event) {
            var owner = this.get('owner');
            if (owner._confirmEdit()) {
                this.gotoState('selected');
                owner.invokeStateMethodByValuesOn('moveRight', 'moveDown');
            }
            return true;
        },

        insertTab: function(event) {
            var owner = this.get('owner');
            if (owner._confirmEdit()) {
                this.gotoState('selected');
                owner.invokeStateMethod('insertTab');
            }
            return true;
        },

        insertBacktab: function(event) {
            var owner = this.get('owner');
            if (owner._confirmEdit()) {
                this.gotoState('selected');
                owner.invokeStateMethod('insertBacktab');
            }
            return true;
        },

        mouseDown: function(event) {
            var owner = this.get('owner');
            var cell = owner._cellForTarget(event.target);
            var editField = owner.get('editField');
            if (owner.isCellSelectable(cell) && owner._confirmEdit()) {
                this.gotoState('selected');
                owner.selectCell(cell);
                return true;
            } else if (cell && editField && cell[0] !== editField[0] && !owner._confirmEdit()) {
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
            var scrollable = owner.getPath('parentView.scrollable');
            var selection = owner.get('selection');
            var options = dataCell.options();

            selectedCell.addClass('editing');

            if (!dataCell.showEditor(selectedCell, owner, owner.get('content'))) {
                // No special editor, use one of the defaults
                if (options) { // Drop down menu for fields with a fixed set of options
                    var menu = Flame.MenuView.create({
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
                        close: function() { this.get('parent').gotoState('selected'); this._super(); }
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

            var selectedCell = owner.get('selectedCell');
            selectedCell.removeClass('editing');

            editField.hide();
            editField.removeClass('invalid');
        }
    }),

    didSelectMenuItem: function(value) {
        var editField = this.get('editField');
        editField.val(value || '');
        this._confirmEdit();
        this.invokeStateMethodByValuesOn('moveRight', 'moveDown');
    },

    willLoseKeyResponder: function() {
        this.set('selectedCell', null);
        this.gotoState('loaded');
    },

    // Get the Cell instance that corresponds to the selected cell in the view
    selectedDataCell: function() {
        var selectedCell = this.get('selectedCell');
        return this.get('data')[selectedCell.parent().attr('data-index')][selectedCell.attr('data-index')];
    }.property(),

    editableValue: function(dataCell, readOnly) {
        var editValue = this.get('editValue');
        if (editValue !== null) {
            return editValue;
        } else {
            editValue = readOnly ? dataCell.formattedValue() : dataCell.editableValue();
            return !Ember.none(editValue)? editValue : '';
        }
    },

    didInsertElement: function() {
        this.set('selection', this.$('.table-selection'));
        this.set('editField', this.$('.table-edit-field'));
    },

    _selectionDidChange: function() {
        var selectedCell = this.get('selectedCell');
        if (!selectedCell) {
            return;
        }
        var selection = this.get('selection');
        var scrollable = this.getPath('parentView.scrollable');

        var position = selectedCell.position();
        var scrollTop = scrollable.scrollTop();
        var scrollLeft = scrollable.scrollLeft();

        var offset = jQuery.browser.webkit ? 1 : 2;
        selection.css({
            left: position.left + scrollLeft - offset + 'px',
            top: position.top + scrollTop - offset + 'px',
            width: selectedCell.outerWidth() - 3 + 'px',
            height: selectedCell.outerHeight() - 1 + 'px'
        });

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
        selectedCell.addClass('active-cell');
    }.observes('selectedCell'),

    _selectionWillChange: function() {
        var selectedCell = this.get('selectedCell');
        if (selectedCell) {
            selectedCell.removeClass('active-cell');
        }
    }.observesBefore('selectedCell'),

    _confirmEdit: function() {
        var newValue = this.get('editField').val();
        return this._validateAndSet(newValue);
    },

    // Returns true if cell valid, or false otherwise
    _validateAndSet: function(newValue) {
        var data = this.get('data');
        var selectedCell = this.get('selectedCell');
        var columnIndex = parseInt(selectedCell.attr('data-index'), 10);
        var rowIndex = parseInt(selectedCell.parent().attr('data-index'), 10);
        var dataCell = data[rowIndex][columnIndex];

        // Skip saving if value has not been changed
        if (Ember.compare(dataCell.editableValue(), newValue) === 0) {
            return true;
        } else if (dataCell.validate(newValue)) {
            var cellUpdateDelegate = this.get('tableViewDelegate');
            Ember.assert('No tableViewDelegate set!', !!cellUpdateDelegate || !!cellUpdateDelegate.cellUpdated);

            var index = [rowIndex, columnIndex];
            if (cellUpdateDelegate.cellUpdated(dataCell, newValue, index)) {
                var dirtyCells = this.get('dirtyCells').slice();
                dirtyCells.push([rowIndex, columnIndex]);
                this.set('dirtyCells', dirtyCells);
            }

            return true;
        } else {
            this.get('editField').addClass('invalid');
            return false;
        }
    },

    _cancelEditingOrSelecting: function() {
        this.gotoState('selected');
    },

    invokeStateMethodByValuesOn: function(onRowsState, onColumnsState) {
        if (this.get('areValuesOnRows')) {
            this.invokeStateMethod(onRowsState);
        } else {
            this.invokeStateMethod(onColumnsState);
        }
    },

    selectCell: function(newSelection) {
        if (this.getPath('parentView.allowSelection') && this.isCellSelectable(newSelection)) {
            this.set('selectedCell', newSelection);
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
        cells.css({'width': '%@px'.fmt(width)});
        this.propertyDidChange('selectedCell'); // Let the size of the selection div be updated
    },

    render: function(buffer) {
        this._renderElementAttributes(buffer);
        this.set('selectedCell', null);
        this.gotoState('loaded');
        this._renderTable(buffer);
    },

    _renderTable: function(buffer) {
        var data = this.get('data');
        if (!(data && data[0])) return buffer;

        var rowCount = data.length;
        var columnCount = data[0].length;
        var defaultCellWidth = this.getPath('parentView.defaultColumnWidth');
        var columnLeafs = this.getPath('parentView.content.columnLeafs');
        var cellWidth;

        var classes = 'flame-table';
        if (!this.getPath('parentView.allowSelection')) { classes += ' is-selectable'; }
        buffer = buffer.begin('table').attr('class', classes).attr('width', '1px');
        var i, j;
        for (i = 0; i < rowCount; i++) {
            buffer.push('<tr data-index="'+i+'">');
            for (j = 0; j < columnCount; j++) {
                var cell = data[i][j];
                var cssClassesString = cell ? cell.cssClassesString() : "";
                cellWidth = columnLeafs[j].get('render_width') || defaultCellWidth;
                if (jQuery.browser.mozilla) cellWidth -= 5;
                // Surround the content with a relatively positioned div to make absolute positioning of content work with Firefox
                buffer.push('<td data-index="%@" class="%@" style="width: %@px;" %@><div style="position: relative">%@</div></td>'.fmt(
                        j,
                        (cssClassesString + (j % 2 === 0 ? " even-col" : " odd-col")),
                        cellWidth,
                        (cell && cell.titleValue && cell.titleValue() ? 'title="%@"'.fmt(cell.titleValue()) : ''),
                        (cell ? cell.content() : '<span style="color: #999">...</span>')));
            }
            buffer.push("</tr>");
        }
        buffer = buffer.end(); // table

        // Selection indicator
        buffer = buffer.begin('div').attr('class', 'table-selection')
                     // This div serves as the "invisible" (very transparent) background for the table selection div.
                     // Without this, the table selection div would be totally transparent and render only a border.
                     // This causes inconsistencies in IE; when the table selection div is clicked, it's unclear which
                     // element will receive the event.
                     .begin('div').attr('class', 'table-selection-background').end()
                 .end(); // div.table-selection

        // Edit field (text)
        buffer = buffer.begin('input').attr('class', 'table-edit-field').end();
    },

    // Update dirty cells
    _cellsDidChange: function() {
        this.manipulateCells(this.get('dirtyCells'), function(cell, element, isEvenColumn) {
            var cssClassesString = (cell ? cell.cssClassesString() : "") + (isEvenColumn ? " even-col" : " odd-col");
            var content = cell.content();
            var titleValue = cell.titleValue && cell.titleValue();
            element.className = cssClassesString;
            element.innerHTML = Ember.none(content) ? "" : '<div style="position: relative">' + content + '</div>';
            if (titleValue) {
                element.title = titleValue;
            }
        }, ++this._updateCounter);
    }.observes('dirtyCells'),

    // Mark and disable updating cells
    _updatingCellsDidChange: function() {
        this.manipulateCells(this.get('cellsMarkedForUpdate'), function(cell, element, isEvenColumn) {
            if (cell.pending) {
                // Cell isn't loaded yet, insert a placeholder value
                cell.pending.isUpdating = true;
                element.className += (isEvenColumn ? " even-col" : " odd-col");
            } else {
                cell.isUpdating = true;
                var cssClassesString = cell.cssClassesString() + (isEvenColumn ? " even-col" : " odd-col");
                element.className = cssClassesString;
            }
        });
    }.observes('cellsMarkedForUpdate'),

    manipulateCells: function(cellRefs, callback, updateCounter) {
        var data = this.get('data');
        if (!cellRefs || cellRefs.length === 0) { return; }
        var table = this.$('table.flame-table');

        var allCells = table.find('td');
        // Everyone expects that the cellRefs array is empty when we return from this function. We still need the
        // content so save it elsewhere.
        var content = cellRefs.splice(0, cellRefs.length);
        var updateBatchSize = this.get('batchUpdates') ? this.get('updateBatchSize') : -1;
        this._batchUpdate(updateBatchSize, 0, updateCounter, content, data, allCells, callback);
    },

    _batchUpdate: function(maxUpdates, startIx, updateCounter, cellRefs, data, allCells, callback) {
        if (typeof updateCounter !== "undefined" && updateCounter != this._updateCounter) { return; }
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

Flame.TableView = Flame.View.extend(Flame.Statechart, {
    classNames: 'flame-table-view'.w(),
    childViews: 'tableDataView'.w(),
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

    initialState: 'idle',

    defaultColumnWidth: 88,
    tableDelegate: null,
    content: null,  // Set to a Flame.TableController
    allowRefresh: true,
    batchUpdates: true,

    contentAdapter: function() {
        return Flame.TableViewContentAdapter.create({
            content: this.get('content')
        });
    }.property('content').cacheable(),

    tableDataView: Flame.TableDataView.extend({
        dataBinding: '^content._data',
        dirtyCellsBinding: '^content.dirtyCells',
        areValuesOnRowsBinding: '^content.areValuesOnRows',
        totalRowIdsBinding: '^content.totalRowIds',
        totalColumnIdsBinding: '^content.totalColumnIds',
        tableViewDelegateBinding: '^tableViewDelegate',
        cellsMarkedForUpdateBinding: '^content.cellsMarkedForUpdate',
        batchUpdatesBinding: '^batchUpdates'
    }),

    rowDepth: function() {
        return this.getPath('contentAdapter.rowHeaderRows.maxDepth');
    }.property('contentAdapter.rowHeaderRows').cacheable(),

    idle: Flame.State.extend({
        mouseDown: function(event) {
            var target = jQuery(event.target);
            if (target.is('div.resize-handle')) {
                this.gotoState('resizing');
                var owner = this.get('owner');
                var cell = target.parent();
                owner.set('resizingCell', cell);
                owner.set('dragStartX', event.pageX);
                owner.set('startX', parseInt(target.parent().css('width'), 10));
                owner.set('offset', parseInt(this.getPath('owner.tableCorner').css('width'), 10));
                owner.set('type', cell.is('.column-header td') ? 'column' : 'row');
                return true;
            } else if (!!target.closest('.column-header').length) {
                return true;
            } else if (target.is('a')) {
                return true;
            }

            return false;
        },

        mouseUp: function(event) {
            var clickDelegate = this.getPath('owner.tableViewDelegate');
            if (clickDelegate && clickDelegate.columnHeaderClicked) {
                var target = jQuery(event.target), index, header;
                if (!!target.closest('.column-header').length && (index = target.closest('td').attr('data-leaf-index'))) {
                    if (clickDelegate.columnHeaderClicked) {
                        header = this.getPath('owner.content.columnLeafs')[index];
                        clickDelegate.columnHeaderClicked(header, target);
                    }
                    return true;
                } else if (!!target.closest('.row-header').length) {
                    if (clickDelegate.rowHeaderClicked) {
                        var cell = target.closest('td');
                        index = parseInt(cell.attr('data-index'), 10);
                        header = this.getPath('owner.content._headers.rowHeaders')[index];
                        if (!header) { return false; }
                        clickDelegate.rowHeaderClicked(header, target, index);
                    }
                    return true;
                }
            }

            return false;
        }
    }),

    resizing: Flame.State.extend({
        mouseMove: function(event) {
            var target = jQuery(event.target);
            var cell = this.getPath('owner.resizingCell');
            var deltaX = event.pageX - this.getPath('owner.dragStartX');
            var cellWidth = this.getPath('owner.startX') + deltaX;
            if (cellWidth < 30) { cellWidth = 30; }
            var leafIndex;
            // Adjust size of the cell
            if (this.getPath('owner.type') === 'column') { // Update data table column width
                leafIndex = parseInt(cell.attr('data-leaf-index'), 10) + 1;
                cell.parents('table').find('colgroup :nth-child(%@)'.fmt(leafIndex)).css('width', '%@px'.fmt(cellWidth));
                this.get('owner')._synchronizeColumnWidth();
            } else {
                var width = this.getPath('owner.offset') + deltaX - 2;
                if (width < 30) { width = 30; }
                if (jQuery.browser.mozilla) {
                    width -= 1;
                } else if (jQuery.browser.webkit || jQuery.browser.msie) {
                    width -= 2;
                }
                // Move data table and column header
                this.getPath('owner.scrollable').css('left', '%@px'.fmt(width));
                this.getPath('owner.columnHeader').parent().css('left', '%@px'.fmt(width));
                this.getPath('owner.tableCorner').css('width', '%@px'.fmt(width));
                // Update column width
                var totalDepth = this.getPath('owner.rowDepth');
                var remainingDepth = 0;
                // must account for row headers spanning multiple columns to get the right leafIndex and width
                cell.nextAll().each(function() {
                    var colspan = $(this).attr('colspan');
                    remainingDepth += colspan ? parseInt(colspan, 10) : 1;
                });
                leafIndex = totalDepth - remainingDepth;

                var colWidth = cellWidth;
                if ($(cell).attr('colspan')) {
                    var colStart = leafIndex - parseInt($(cell).attr('colspan'), 10) + 1; // the first column included in the span
                    for(colStart; colStart < leafIndex; colStart++) {
                        colWidth -= parseInt(cell.parents('table').find('colgroup :nth-child(%@)'.fmt(colStart)).css('width'), 10);
                    }
                }
                cell.parents('table').find('colgroup :nth-child(%@)'.fmt(leafIndex)).css('width', '%@px'.fmt(colWidth));
            }
        },

        mouseUp: function(event) {
            var owner = this.get('owner');
            if (owner.get('type') === 'column') {
                var resizeDelegate = owner.get('tableViewDelegate');
                if (resizeDelegate && resizeDelegate.columnResized) {
                    var cell = owner.get('resizingCell');
                    var width = parseInt(cell.css('width'), 10);
                    var index = parseInt(cell.attr('data-leaf-index'), 10);
                    resizeDelegate.columnResized(index, width);
                }
            }
            this.gotoState('idle');
            return true;
        }
    }),

    _synchronizeColumnWidth: function() {
        // Update data table columns
        var cell = this.get('resizingCell');
        var table = this.get('childViews')[0];
        var width = parseInt(cell.css('width'), 10);
        var index = parseInt(cell.attr('data-leaf-index'), 10);
        if (jQuery.browser.webkit || jQuery.browser.msie) { width += 4; }
        if (jQuery.browser.mozilla) { width -= 2; }
        table.updateColumnWidth(index, width);
    },

    willInsertElement: function() {
        var scrollable = this.get('scrollable');
        if (scrollable) {
            scrollable.unbind();
        }
    },

    didInsertElement: function() {
        this.set('scrollable', this.$('.flame-table').parent().parent());
        this.set('rowHeader', this.$('.row-header table'));
        this.set('columnHeader', this.$('.column-header table'));
        this.set('tableCorner', this.$('.table-corner'));
        this.get('scrollable').scroll({self: this}, this.didScroll);
    },

    didScroll: function(event) {
        var self = event.data.self;
        var scrollable = self.get('scrollable');
        // Scroll fixed headers
        self.get('rowHeader').css('top', '-%@px'.fmt(scrollable.scrollTop()));
        self.get('columnHeader').css('left', '-%@px'.fmt(scrollable.scrollLeft()));
    },

    _headersDidChange: function() {
        this.rerender();
        // When the headers change, fully re-render the view
    }.observes('contentAdapter.headers'),

    render: function(buffer) {
        this._renderElementAttributes(buffer);
        var renderColumnHeader = this.get('renderColumnHeader');
        var renderRowHeader = this.get('renderRowHeader');
        var didRenderTitle = false;

        var headers = this.getPath('contentAdapter.headers');
        if (!headers) {
            return; // Nothing to render
        }

        if (this.getPath('content.title')) {
            buffer = buffer.push('<div class="panel-title">%@</div>'.fmt(this.getPath('content.title')));
            didRenderTitle = true;
        }

        var defaultColumnWidth = this.get('defaultColumnWidth');
        var columnHeaderRows = this.getPath('contentAdapter.columnHeaderRows');
        var rowHeaderRows = this.getPath('contentAdapter.rowHeaderRows');
        var columnHeaderHeight = columnHeaderRows.maxDepth * 21 + 1 + columnHeaderRows.maxDepth;
        var leftOffset = 0;
        if (renderRowHeader) {
            leftOffset = rowHeaderRows.maxDepth * defaultColumnWidth + 1 + (renderColumnHeader ? 0 : 5);
        }
        var topOffset = didRenderTitle ? 18 : 0;

        if (renderColumnHeader) {
            // Top left corner of the headers
            buffer = buffer.push('<div class="table-corner" style="top: %@px; left: 0px; height: %@px; width: %@px;"></div>'.fmt(topOffset, columnHeaderHeight, leftOffset));
            // Column headers
            buffer = this._renderHeader(buffer, 'column', leftOffset, defaultColumnWidth);
            topOffset += columnHeaderHeight;
        }
        if (renderRowHeader) {
            // Row headers
            buffer = this._renderHeader(buffer, 'row', topOffset, defaultColumnWidth);
        }

        // Scrollable div
        buffer = buffer.begin('div').attr('style', 'overflow: auto; bottom: 0px; top: %@px; left: %@px; right: 0px;'.fmt(topOffset, leftOffset));
        buffer = buffer.attr('class', 'scrollable');
        // There should really only be one child view, the TableDataView
        this.forEachChildView(function(view) {
            view.renderToBuffer(buffer);
        });
        buffer = buffer.end(); // div
    },

    _renderHeader: function(buffer, type, offset, defaultColumnWidth) {
        var headers = this.getPath('contentAdapter.headers');
        if (!headers) {
            return buffer.begin('div').end();
        }

        var position, i;
        if (type === 'column') {
            headers = this.getPath('contentAdapter.columnHeaderRows');
            position = 'left';
        } else {
            headers = this.getPath('contentAdapter.rowHeaderRows');
            position = 'top';
        }
        var length = headers.length;

        buffer = buffer.begin('div').addClass('%@-header'.fmt(type)).attr('style', 'position: absolute; %@: %@px'.fmt(position, offset));
        buffer = buffer.begin('table').attr('style', 'position: absolute').attr('width', '1px');
        buffer = buffer.begin('colgroup');
        if (type === 'row') {
            for (i = 1; i < 4; i++) {
                buffer = buffer.push('<col style="width: %@px;" class="level-%@" />'.fmt(defaultColumnWidth, i));
            }
        } else {
            var l = this.getPath('content.columnLeafs').length;
            for (i = 0; i < l; i++) {
                buffer = buffer.push('<col style="width: %@px;" />'.fmt(this.getPath('content.columnLeafs')[i].get('render_width') || defaultColumnWidth));
            }
        }
        buffer = buffer.end();
        for (i = 0; i < length; i++) {
            buffer = buffer.begin('tr');
            if (type === 'column') {
                buffer = buffer.attr('class', 'level-%@'.fmt(i + 1));
            }
            buffer = this._renderRow(buffer, headers[i], type, i);
            buffer = buffer.end(); // tr
        }
        buffer = buffer.end().end(); // table // div

        return buffer;
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
            buffer = buffer.begin('td');

            headerLabel = header.get ? header.get('headerLabel') : header.label;
            buffer = buffer.attr('title', headerLabel.replace(/<br>/g, '\n'));

            if (header.rowspan > 1) {
                buffer = buffer.attr('rowspan', header.rowspan);
            }
            if (header.colspan > 1) {
                buffer = buffer.attr('colspan', header.colspan);
            }

            label = '<div class="label">%@</div>';
            buffer.attr('class', (i % 2 === 0 ? "even-col" : "odd-col"));
            if (type === 'column' && !header.hasOwnProperty('children')) { // Leaf node
                buffer = buffer.attr('data-index', i);
                // Mark the leafIndex, so when sorting it's trivial to find the correct field to sort by
                buffer = buffer.attr('data-leaf-index', header.leafIndex);
                if (this.get('isResizable') && this.get('renderColumnHeader')) {
                    buffer = buffer.push('<div class="resize-handle">&nbsp;</div>');
                }

                var headerSortDelegate = this.get('tableViewDelegate');
                if (headerSortDelegate && headerSortDelegate.getSortForHeader) {
                    sortDirection = headerSortDelegate.getSortForHeader(header);
                }
                var sortClass = sortDirection ? 'sort-%@'.fmt(sortDirection) : '';
                label = '<div class="label ' + sortClass +'">%@</div>';
            } else if (type === 'row') {
                buffer = buffer.attr('data-index', header.dataIndex);
                if (this.get('renderColumnHeader')) {
                    if (this.get("isResizable")) {
                        if (header.hasOwnProperty('children')) {
                            // Ensure that resize-handle covers the whole height of the cell border. Mere child count
                            // does not suffice with multi-level row headers.
                            var leafCount = countLeaves(header);

                            buffer = buffer.push('<div class="resize-handle" style="height: %@px"></div>'.fmt(leafCount * 21));
                        } else {
                            buffer = buffer.push('<div class="resize-handle"></div>');
                        }
                    }
                    if (this.get("isRowHeaderClickable") && header.get('isClickable')) {
                        label = '<a href="javascript:void(0)">%@</a>';
                    }
                }
            }
            buffer = buffer.push(label.fmt(headerLabel)).end(); // td
        }
        return buffer;
    }
});

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

    becomeKeyResponder: function() {
        this.get('textArea').becomeKeyResponder();
    },

    textArea: Ember.TextArea.extend(Flame.EventManager, Flame.FocusSupport, {
        classNameBindings: ['isInvalid', 'isFocused'],
        acceptsKeyResponder: true,
        // Start from a non-validated state. 'isValid' being null means that it hasn't been validated at all (perhaps
        // there's no validator attached) so it doesn't make sense to show it as invalid.
        isValid: null,
        isInvalid: Flame.computed.equals('isValid', false),
        valueBinding: '^value',
        placeholderBinding: '^placeholder',
        isVisibleBinding: '^isVisible',

        keyDown: function() { return false; },
        keyUp: function() {
            this._elementValueDidChange();
            return false;
        }
    })
});


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
            return this.getPath('content.treeItemIsExpanded') || this.get('defaultIsExpanded');
        } else {
            this._isExpanded = value;
            return value;
        }
    }.property('content.treeItemIsExpanded', 'defaultIsExpanded').cacheable(),
    layout: { left: 0, right: 0, top: 0, height: 0 },

    defaultIsExpanded: function() {
        return this.getPath('parentView.rootTreeView.defaultIsExpanded');
    }.property('parentView.rootTreeView.defaultIsExpanded').cacheable(),

    // Don't use the list view isSelected highlight logic
    isSelected: function(key, value) {
        return false;
    }.property().cacheable(),

    // This is the highlight logic for tree items, the is-selected class is bound to the flame-tree-item-view-container
    classAttribute: function() {
        return this.get('content') === this.getPath('parentView.rootTreeView.selection') ? 'flame-tree-item-view-container is-selected' : 'flame-tree-item-view-container';
    }.property('content', 'parentView.rootTreeView.selection').cacheable(),

    // The HTML that we need to produce is a bit complicated, because while nested items should appear
    // indented, the selection highlight should span the whole width of the tree view, and should not
    // cover possible nested list view that shows possible children of this item. The div with class
    // flame-tree-item-view-container is meant to display the selection highlight, and the div with class
    // flame-tree-item-view-pad handles indenting the item content. Possible nested list comes after.
    //
    // TODO It seems using handlebars templates is quite a bit slower than rendering programmatically,
    //      which is very much noticeable in IE7. Should probably convert to a render method.
    handlebars: '<div {{bindAttr class="classAttribute"}}><div class="flame-tree-item-view-pad">' +
            '{{#if hasChildren}}{{view toggleButton}}{{/if}}' +
            '{{view treeItemViewClass content=content}}</div></div>'+
            '{{#if renderSubTree}}{{view nestedTreeView}}{{/if}}',

    /**
     * Do we want to create the view for the subtree? This will return true if there is a subtree and it has
     * been shown at least once.
     *
     * Thus the view for the subtree is created lazily and never removed. To achieve the laziness, this property is
     * updated by _updateSubTreeRendering and cached.
     */
    renderSubTree: function() {
        return this.get("hasChildren") && this.get("isExpanded");
    }.property().cacheable(),

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
    treeItemViewClass: function() {
        return Flame.View.extend({
            useAbsolutePosition: false,
            layout: { top: 0, left: 0, right: 0, height: 20 },
            classNames: ['flame-tree-item-view-content'],
            contentIndexBinding: 'parentView.contentIndex',
            handlebars: function() {
                return this.getPath('parentView.parentView.rootTreeView').handlebarsForItem(this.get('content'));
            }.property('content').cacheable()
        });
    }.property(),

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
            return this.getPath("childViews.lastObject.childViews.firstObject");
        }
        return null;
    }.property("showsubTree").cacheable(),

    hasChildren: function() {
        return !Ember.none(this.getPath('content.treeItemChildren'));
    }.property('content.treeItemChildren'),

    mouseUp: function() {
        if (this.getPath('parentView.rootTreeView.clickTogglesIsExpanded')) {
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
    nestedTreeView: function() {
        return Flame.TreeView.extend({
            useAbsolutePosition: this.getPath('parentView.rootTreeView.useAbsolutePositionForItems'),
            layoutManager: Flame.VerticalStackLayoutManager.create({ topMargin: 0, spacing: 0, bottomMargin: 0 }),
            layout: { top: 0, left: 0, right: 0 },
            classNames: ['flame-tree-view-nested'],
            isVisible: Flame.computed.bool('parentView.isExpanded'), // Ember isVisible handling considers undefined to be visible
            allowSelection: this.getPath('parentView.rootTreeView.allowSelection'),
            allowReordering: this.getPath('parentView.rootTreeView.allowReordering'),
            content: this.getPath('content.treeItemChildren'),
            itemViewClass: this.getPath('parentView.rootTreeView.itemViewClass'),
            isNested: true
        });
    }.property('content')
});



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
            'App.Folder': '{{content.name}} ({{content.treeItemChildren.length}} reports)',
            'App.Report': '{{content.name}}',
            defaultTemplate: '{{content.title}}'
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
        return 'level-%@'.fmt(this.getPath('treeLevel'));
    }.property('treeLevel'),

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
            dragHelper.get('itemPath').insertAt(0, this.getPath('parentView.contentIndex'));
            parentTreeView.startReordering(dragHelper, event);
        } else {
            Flame.set('mouseResponderView', this);  // XXX a bit ugly...
            this._super(dragHelper, event);
        }
    },

    treeLevel: function() {
        return (this.getPath('parentTreeView.treeLevel') || 0) + 1;
    }.property('parentTreeView.treeLevel'),

    parentTreeView: function() {
        return this.get('isNested') ? this.getPath('parentView.parentView') : undefined;
    }.property('isNested', 'parentView.parentView'),

    rootTreeView: function() {
        return this.getPath('parentTreeView.rootTreeView') || this;
    }.property('parentTreeView.rootTreeView')

});


/*
 * VerticalSplitView divides the current view between leftView and rightView using a vertical
 * dividerView.
 */

Flame.VerticalSplitView = Flame.SplitView.extend({
    classNames: 'flame-vertical-split-view'.w(),
    childViews: 'leftView dividerView rightView'.w(),
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
        Ember.assert('Flame.VerticalSplitView needs leftView and rightView!', !!this.get('leftView') && !!this.get('rightView'));
        this._super();

        if (this.get('flex') === 'right') this.rightWidth = undefined;
        else this.leftWidth = undefined;

        this._updateLayout(); // Update layout according to the initial widths

        this.addObserver('leftWidth', this, this._updateLayout);
        this.addObserver('rightWidth', this, this._updateLayout);
        this.addObserver('minLeftWidth', this, this._updateLayout);
        this.addObserver('minRightWidth', this, this._updateLayout);
    },

    _updateLayout: function() {
        var leftView = this.get('leftView');
        var dividerView = this.get('dividerView');
        var rightView = this.get('rightView');

        var totalWidth = this.$().innerWidth();
        var dividerThickness = this.get('dividerThickness');
        var leftWidth = this.get('flex') === 'right' ? this.get('leftWidth') : undefined;
        var rightWidth = this.get('flex') === 'left' ? this.get('rightWidth') : undefined;
        if (leftWidth === undefined && rightWidth !== undefined && totalWidth !== null) leftWidth = totalWidth - rightWidth - dividerThickness;
        if (rightWidth === undefined && leftWidth !== undefined && totalWidth !== null) rightWidth = totalWidth - leftWidth - dividerThickness;

        if ('number' === typeof leftWidth && leftWidth < this.get('minLeftWidth')) {
            rightWidth += leftWidth - this.get('minLeftWidth');
            leftWidth = this.get('minLeftWidth');
        }
        if ('number' === typeof rightWidth && rightWidth < this.get('minRightWidth')) {
            leftWidth += rightWidth - this.get('minRightWidth');
            rightWidth = this.get('minRightWidth');
        }
        this.set('leftWidth', leftWidth);
        this.set('rightWidth', rightWidth);

        if (this.get('flex') === 'right') {
            this._setDimensions(leftView, 0, leftWidth, undefined);
            this._setDimensions(dividerView, leftWidth, dividerThickness, undefined);
            this._setDimensions(rightView, leftWidth + dividerThickness, undefined, 0);
        } else {
            this._setDimensions(leftView, 0, undefined, rightWidth + dividerThickness);
            this._setDimensions(dividerView, undefined, dividerThickness, rightWidth);
            this._setDimensions(rightView, undefined, rightWidth, 0);
        }
    },

    _setDimensions: function(view, left, width, right) {
        var layout = view.get('layout');
        layout.set('left', left);
        layout.set('width', width);
        layout.set('right', right);
        layout.set('top', 0);
        layout.set('bottom', 0);

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
Flame.Repeater = Ember.Object.extend(Flame.ActionSupport, {
    init: function() {
        this._super();
        this._scheduleNext();
    },

    stop: function() {
        Ember.run.cancel(this._timer);
    },

    reschedule: function() {
        this.stop();
        this._scheduleNext();
    },

    _scheduleNext: function() {
        //Use (new Date()).getTime() instead of Date.now() for IE-support.
        var wait;

        if (this.get('interval') === 0) {
            wait = 0;
        } else {
            var lastInvocation = this.get('lastInvoke');
            if (Ember.none(lastInvocation)) {
                wait = this.get('interval');
            } else {
                wait = (new Date()).getTime() - lastInvocation + this.get('interval');
            }

            if (wait < 0) {
                wait = 0;
            }
        }

        this._timer = Ember.run.later(this, function() {
            this.set('lastInvoke', (new Date()).getTime());
            this.fireAction();
            this._scheduleNext();
        }, wait);
    }
});



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
 *  Mix this in to your model object to perform on the fly validation.
 *  You must provide a 'validations' hash, with the keys defining each property of your model to validate,
 *  and the values the validation logic.
 *
 *  The validation logic should be defined either as a Flame validator singleton, an anonymous function, or a hash.
 *
 *  Validation is done on-demand, demand being the first call to foo.get("barIsValid") or foo.get("isValid").
 *  Thus we don't validate stuff that just goes to DataStore but only the thing we use and about whose validity we're
 *  interested in.
 *
 *  If you define 'Coupled properties' for a property foo, this means that when foo has changed, we need to revalidate not
 *  just foo but also each coupled property. For example, if we have properties password and passwordCheck, when we
 *  edit password we need to revalidate the validation for passwordCheck also.
 *
 *  Validations can only be set once to the object (this is usually done in the definition of the objects class).
 *
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
        if (Ember.none(ignoreCoupledProperties)) {
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
                throw "Hint: coupledProperties must be an array!";
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
    }.property(),

    _validate: function(validator, target, key, value) {
        var isValid = null;
        if (validator instanceof Flame.Validator) {
            isValid = validator.validate(target, key);
        } else if (!Ember.none(validator)) {
            //if not Flame.Validator, assume function
            isValid = validator.call(this, value);
        }
        return isValid;
    },

    /**
     @returns {Boolean} to indicate if all properties of model are valid.
     **/
    _checkValidity: function() {
        var validations = this.get("validations");
        for (var key in validations) {
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
    }.property(),

    /**
     * Allow setting of validations only once. Validations set through this property are ignored after they've been
     * set once.
     */
    validations: function(key, val) {
        if (!Ember.none(val)) {
            if (this._validations === null) {
                this._validations = val;
            } else {
                Ember.Logger.info("Trying to set validations after the validations have already been set!");
            }
        }
        return this._validations;
    }.property(),

    /**
     * Create all the *isValid properties this object should have based on its validations-property.
     */
    _createIsValidProperties: function() {
        var validations = this.get("validations");
        var propertyName;
        var self = this;
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
        if (this._propertyValidity === null) { this._propertyValidity = {}; }
        var self = this;
        Ember.defineProperty(this, this.isValidProperty(propertyName), Ember.computed(
                function(propertyIsValidName, value) {
                    // Emulate common property behaviour where setting undefined value does nothing.
                    if (typeof value !== "undefined") {
                        self.propertyWillChange(propertyIsValidName);
                        self._propertyValidity[propertyIsValidName] = value;
                        self.propertyDidChange(propertyIsValidName);
                    }
                    return self._propertyValidity[propertyIsValidName];
                }
        ).property());
    },

    /**
     * Add validation for
     * @param {String} propertyName Name of the property we want to validate.
     * @param {Object} validator Flame.Validator or function that will handle the validation of this property.
     */
    setValidationFor: function(propertyName, validator) {
        // TODO do this without setting computed properties, using only simple properties (i.e. the kind 'foo' is when
        // defined with Ember.Object({foo: false}).

        var validations = this.get("validations");
        validations[propertyName] = validator;
        this._createIsValidProperty(propertyName);
        this.removeObserver(propertyName, this, 'validateProperty'); // In case we're redefining the validation
        this.addObserver(propertyName, this, 'validateProperty');
        this.validateProperty(this, propertyName);
    },

    unknownProperty: function(key) {
        var res = /^(.+)IsValid$/.exec(key);
        var validations = this.get("validations");
        if (res && validations) {
            var propertyName = res[1];
            if (validations[propertyName]) {
                this._createIsValidProperties();
                return this.get(key);
            }
        }
        // Standard bailout, either the property wasn't of the form fooIsValid or we don't have property foo in
        // this.validations.
        return this._super(key);
    },

    setUnknownProperty: function(key, value) {
        var res = /^(.+)IsValid$/.exec(key);
        var validations = this.get("validations");
        if (res && validations) {
            var propertyName = res[1];
            if (validations[propertyName]) {
                this._createIsValidProperties();
                return this.set(key, value);
            }
        }
        // Standard bailout, either the property wasn't of the form fooIsValid or we don't have property foo in
        // this.validations.
        return this._super(key, value);
    }
});

Flame.Validator.association = Flame.Validator.create({
   validate: function(target, key) {
       var association = target.get(key);
       if (Ember.isArray(association)) {
           return association.every(function(assoc) { return assoc.get('isValid'); });
       } else if (association) {
           return association.get('isValid');
       } else {
           return true;
       }
   }
});
Flame.Validator.email = Flame.Validator.create({
    validate: function(target, key) {
        var pattern = /^(([A-Za-z0-9]+_+)|([A-Za-z0-9]+\-+)|([A-Za-z0-9]+\.+)|([A-Za-z0-9]+\++))*[A-Za-z0-9\-]+@((\w+\-+)|(\w+\.))*\w{1,63}\.[a-zA-Z]{2,6}$/i;
        var string = target.get(key);
        return pattern.test(string);
    }
});
Flame.Validator.notBlank = Flame.Validator.create({
   validate: function(target, key) {
       var string = target.get(key);
       if (string) {
           return !string.toString().isBlank();
       } else {
           return false;
       }
   }
});
Flame.Validator.number = Flame.Validator.create({
    validate: function(target, key) {
        var value = target.get(key);
        return (value === '') || !(isNaN(value) || isNaN(parseFloat(value)));
    }
});
Flame.VERSION = '0.2.1-184-gd108cf1';
