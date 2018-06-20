---
title: "Experimental UI"
sidebar_label: Introduction
---

Starting with Home Assistant 0.72, we're experimenting with a way of defining your user interface. The aproach is fundamentally different from the current approach. The old user interface relied solely on the state machine. This caused trouble as it meant that people wanted to store things in the state machine to control the user interface. That's a big violation of seperation of concern. With the new user interface, we're taking a completely different approach. All user interface configuration will live in a seperate file, controlled by the user. This allows us to build a faster user interface that is more customizable.

![Visual comparison of old configuration versus new configuration](/img/en/frontend/experimental-ui-comparison.png)

<!-- source: https://docs.google.com/drawings/d/1O1o7-wRlnsU1lLgfdtn3s46P5StJjSL5to5RU9SV8zs/edit?usp=sharing -->

## Trying it out

Create a new file `<config>/experimental-ui.yaml` and add the following content:

```yaml
title: My Awesome Home
views:
    # The name of a view will be used as tab title.
    # Might be used for other things in the future.
  - name: Example
    # Each view can have a different theme applied. Theme should be defined in the frontend.
    theme: dark-mode
    # The cards to show on this view.
    cards:
        # The entities card will take a list of entities and show their state.
      - type: entities
        # Title of the entities card
        title: Example
        # The entities here will be shown in the same order as specified.
        entities:
          - input_boolean.switch_ac_kitchen
          - input_boolean.switch_ac_livingroom
          - input_boolean.switch_tv

        # The filter card will filter available entities for certain criteria
        # and render it as type 'entities'.
      - type: entity-filter
        # Filter criteria. They are all optional.
        filter:
          domain: input_boolean
          state: 'on'
        # This config will be passed to the card rendering the filter results
        card_config:
          title: Input booleans that are on

    # Specify a tab_icon if you want the view tab to be an icon.
  - tab_icon: mdi:home-assistant
    # Name of the view. Will be used as the tooltip for tab icon
    name: Second view
    cards:
      - type: entities
        title: Lots of Kitchen AC
        entities:
            # It is totally possible to render duplicates.
          - input_boolean.switch_ac_kitchen
          - input_boolean.switch_ac_kitchen
          - input_boolean.switch_ac_kitchen
          - input_boolean.switch_ac_kitchen
          - input_boolean.switch_ac_kitchen
          - input_boolean.switch_ac_kitchen
```

Add to your `configuration.yaml`:

```yaml
input_boolean:
  switch_ac_kitchen:
    name: AC kitchen
  switch_ac_livingroom:
    name: AC living room
  switch_tv:
    name: TV
```

Now restart Home Assistant, navigate to `<YOUR HASS URL>/experimental-ui`. When you make changes to `experimental-ui.yaml`, you don't have to restart Home Assistant or refresh the page. Just hit the refresh button at the top of the UI.

## Current limitations

This is the very very early version aimed at gathering feedback. Discussion and suggestions are welcome in the [ui-schema repository](https://github.com/home-assistant/ui-schema).

## Change log

**Home Assistant 0.72**

- Initial release supporting title, defining views with a name, tab icon, theme and cards. Supported cards are entities, entity-filter and custom.