var App = Ember.Application.create();

App.RootView = Flame.View.extend({
    childViews: ['splitView'],

    splitView: Flame.VerticalSplitView.extend({
        leftWidth: 250,
        minLeftWidth: 200,

        leftView: Flame.View.extend({
            childViews: ['titleView', 'buttonView'],

            titleView: Flame.LabelView.extend({
                layout: { left: 5, right: 5, top: 10 },
                textAlign: Flame.ALIGN_CENTER,
                value: 'Flame.js'
            }),

            buttonView: Flame.ButtonView.extend({
                layout: { left: 5, right: 5, top: 40 },
                title: 'Flame!',
                action: function() {
                    Flame.AlertPanel.info({
                        title: 'Hi!',
                        message: 'This is a Flame.AlertPanel'
                    }).popup();
                }
            })
        }),

        rightView: Flame.View.extend({
            childViews: ['labelView'],

            labelView: Flame.LabelView.extend({
                layout: { left: 50, top: 20 },
                value: 'Hello World!'
            })
        })
    })
});
