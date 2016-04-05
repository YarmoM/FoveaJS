# FoveaJS

## Usage

Initializing the slideshow

```javascript
<fovea-slideshow ratio="1.33" startslide="1" background="grey">
  ...
</fovea-slideshow>
```

Make a new slide

```javascript
<slide background="red" bookmark="1">
  <content>
    // H1, H2, p...
  </content>

  <notes>
    // Notes
  </notes>
</slide>
```

Make a new slide with image background

```javascript
<slide background-image="url" background-brightness="0.5" background-saturate="2" background-blur="4" background-cssgram="nashville">
  <content>
    // H1, H2, p...
  </content>

  <notes>
    // Notes
  </notes>
</slide>
```

Insert images inside the `<content>` tag

```javascript
<images>
  <div>
    <img src="url" alt="" />
  </div>
  <div canzoom>
    <img src="url" alt="" />
  </div>
</images>
```
