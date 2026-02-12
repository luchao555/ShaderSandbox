#version 300 es
precision mediump float;
in vec2 pos;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
// uniform sampler2D cam;
// uniform sampler2D video;
uniform int u_grid;
uniform int u_grid2;
uniform bool u_toggle;
uniform bool u_toggle2;

#define PI 3.14159265359

uniform sampler2D u_bg;
uniform sampler2D u_img;


/* RGB TO CMYK */
#ifndef FNC_MMIN
#define FNC_MMIN

float mmin(const float v) { return v; }
float mmin(in float a, in float b) { return min(a, b); }
float mmin(in float a, in float b, in float c) { return min(a, min(b, c)); }
float mmin(in float a, in float b, in float c, in float d) { return min(min(a,b), min(c, d)); }

float mmin(const vec2 v) { return min(v.x, v.y); }
float mmin(const vec3 v) { return mmin(v.x, v.y, v.z); }
float mmin(const vec4 v) { return mmin(v.x, v.y, v.z, v.w); }

#endif

#if !defined(FNC_SATURATE) && !defined(saturate)
#define FNC_SATURATE
#define saturate(V) clamp(V, 0.0, 1.0)
#endif

#ifndef FNC_RGB2CMYK
#define FNC_RGB2CMYK
vec4 rgb2cmyk(const in vec3 rgb) {
    float k = mmin(1.0 - rgb);
    float invK = 1.0 - k;
    vec3 cmy = (1.0 - rgb - k) / invK;
    cmy *= step(0.0, invK);
    return saturate(vec4(cmy, k));
}
#endif

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

/* BLOTCHES */
/*
contributors: [Stefan Gustavson, Ian McEwan]
description: Fast, accurate inverse square root. 
use: <float|vec2|vec3|vec4> taylorInvSqrt(<float|vec2|vec3|vec4> x)
*/
#ifndef FNC_TAYLORINVSQRT
#define FNC_TAYLORINVSQRT
float taylorInvSqrt(in float r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 taylorInvSqrt(in vec2 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 taylorInvSqrt(in vec3 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec4 taylorInvSqrt(in vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
#endif

#ifndef FNC_MOD289
#define FNC_MOD289
float mod289(const in float x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(const in vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 mod289(const in vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec4 mod289(const in vec4 x) { return x - floor(x * (1. / 289.)) * 289.; }
#endif

#ifndef FNC_PERMUTE
#define FNC_PERMUTE
float permute(const in float v) { return mod289(((v * 34.0) + 1.0) * v); }
vec2 permute(const in vec2 v) { return mod289(((v * 34.0) + 1.0) * v); }
vec3 permute(const in vec3 v) { return mod289(((v * 34.0) + 1.0) * v); }
vec4 permute(const in vec4 v) { return mod289(((v * 34.0) + 1.0) * v); }
#endif


float snoise(in vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //   x0 = x0 - 0.0 + 0.0 * C.xxx;
    //   x1 = x0 - i1  + 1.0 * C.xxx;
    //   x2 = x0 - i2  + 2.0 * C.xxx;
    //   x3 = x0 - 1.0 + 3.0 * C.xxx;
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
    //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

float blotches (vec2 st, vec2 center, float radius){
    float d = length(fract(st) - 0.5);
    float n = snoise(vec3(10.0*st, 0.0))
    + 0.5*snoise(vec3(40.0*st, 2.0));
    return step(radius*0.9, d + 0.1*n);
}


/* SHAPES */
float circle (vec2 st, vec2 center, float radius){
    return step(radius, distance(st,center));
}

float square (vec2 st, vec2 center, float size){
    float d = length( min(abs(st)-.3,0.) );
    return step(size, d);
}

float diamond (vec2 st, vec2 center, float size){
    vec2 diff = abs(st - center);
    return step(size, diff.x + diff.y);
}


/* UTILS */
vec3 unmultiply(vec4 texel) {
    return texel.a > 0.0 ? texel.rgb / texel.a : vec3(0.0);
}

vec4 premultiply(vec3 color, float alpha) {
    return vec4(color * alpha, alpha);
}


mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

vec2 rotategridf(vec2 st, float angle, float scale){
    vec2 st_angle = st;
    st_angle -= vec2(0.5*scale);
    // rotate the space
    st_angle = rotate2d( angle ) * st_angle;
    // move it back to the original place
    st_angle += vec2(0.5*scale);
    return fract(st_angle);
}

mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}

vec3 placeElement (vec2 _st, vec2 _pos, float _grid, vec2 _scale, float _rot, vec3 _img){
    _st -= vec2(0.5*_grid);
    _st = scale( _scale) * _st;
    _st += vec2(0.5*_grid);
    return vec3(0.0);
}

vec3 halftoning(vec2 _st, float _grid, vec3 _img){

    /* ANGLE CALCULATIONS */
    vec2 fpos_k = rotategridf(_st, 0.78, _grid);  // get the fpos for black
    vec2 fpos_c = rotategridf(_st, 0.26, _grid);  // get the fpos for cyan
    vec2 fpos_m = rotategridf(_st, 1.3, _grid);   // get the fpos for magenta
    vec2 fpos_y = rotategridf(_st, 0., _grid);  // get the fpos for yellow


    vec3 color = vec3(0.0);
    vec3 color_circle = vec3(0.0);

    // Create negative image
    _img.rgb = vec3(1.0)-_img.rgb;
    // Get black and white of the image
    float mean = (_img.r+_img.g+_img.b)/3.0;
    float slope = 1.0 - pow(abs (sin(PI * (mean+1.0) / 2.0)), 3.0);
    slope = 1.0 - pow(abs (mean-1.), 5.5);
    float radius = (mean/1.5)*slope;
    float circle_res = 1.-blotches(fpos_k, vec2(0.5), radius);
    //vec4 color_circle = vec4(circle, circle, circle, img.a);
    color = vec3(1.0-circle_res);

    color_circle.r = blotches(fpos_y , vec2(0.5), _img.r/1.5);
    color_circle.g = blotches(fpos_c, vec2(0.5), _img.g/1.5);
    color_circle.b = blotches(fpos_m , vec2(0.5), _img.b/1.5);


    color *= color_circle;
    return color;
}

vec3 mergeImg(vec2 _st, vec3 _bg, vec3 _img, float _mask){
    vec3 result = _bg;
    if (_mask == 1.0) {
        result = _img;
    }
    return result;
}


vec3 pointcloud(vec2 _st, vec3 _img, int _fc){

    vec3 color = vec3(0.0);

    vec2 fpos = fract(_st);  // get the fractional coords

    // Create negative image
    _img.rgb = vec3(1.0)-_img.rgb;
    // Get black and white of the image
    float mean = (_img.r+_img.g+_img.b)/3.0;
    float slope = 1.0 - pow(abs (sin(PI * (mean+1.0) / 2.0)), 3.0);
    slope = 1.0 - pow(abs (mean-1.), 5.5);
    float radius = (mean/1.5)*slope;
    float circle_res = 0.0;
    /* SELECT FUNCTION TO APPLY */
    if (_fc == 1){
        circle_res = 1.-square(fpos, vec2(0.5), radius);

    } else if (_fc == 2) {
        circle_res = 1.-blotches(fpos, vec2(0.5), radius);
    } else if (_fc == 3) {
        circle_res = 1.-circle(fpos, vec2(0.5), radius);
    } else {
        circle_res = 1.-diamond(fpos, vec2(0.5), radius);
    }
    //vec4 color_circle = vec4(circle, circle, circle, img.a);
    color = vec3(1.0-circle_res);
    return color;
}

vec4 border(vec2 _st, float _size){
    vec4 color = vec4(0.0);
    vec2 bl = step(vec2(_size),_st);       // bottom-left
    vec2 tr = step(vec2(_size),1.0-_st);   // top-right
    color = vec4(bl.x * bl.y * tr.x * tr.y);
    return color;
}

float mask(vec2 _st, vec3 _img, float _thresh){
    float mean = (_img.r+_img.g+_img.b)/3.0;
    return step(mean, _thresh);
}



void main(){

    /* PARAMETERS */
    // vec2 offset = vec2(.2,0.2);
    vec2 st = pos;
    vec2 st2 = pos;


    vec2 bl = step(vec2(0.05),st);       // bottom-left
    vec2 tr = step(vec2(0.05),1.0-st);   // top-right

    st.y = 1.0 - pos.y;
    float grid = float(u_grid);
    st *= grid; // Scale the coordinate system by 10



    st2.y = 1.0 - pos.y;
    float grid2 = float(u_grid2);
    st2 *= grid2; // Scale the coordinate system by 10

    vec2 ipos = floor(st);  // get the integer coords
    vec2 ipos2 = floor(st2);  // get the integer coords
    // vec2 fpos = fract(st);  // get the fractional coords

    // Import images and normalize colors
    vec4 img = texture(u_bg, ipos/grid);
    vec3 norm_img = unmultiply(img);


    vec4 img2 = texture(u_img, ipos2/grid2);
    vec3 norm_img2 = unmultiply(img2);
    float mask1 = mask(st2,norm_img2,0.5);

    vec3 color = vec3(0.0);
    if (u_toggle) {
        color = halftoning(st, grid, norm_img);
    } if (!u_toggle) {
        color = pointcloud(st, norm_img, 4);
    }

    vec3 color2 = vec3(0.0);
    if (u_toggle2) {
        color2 = pointcloud(st2, norm_img2, 2);
    } if (!u_toggle2) {
        color2 = halftoning(st2, grid2, norm_img2);
    }

    float mask2 = mask(st2,color2,0.5);

    //vec3 border = vec3(bl.x * bl.y * tr.x * tr.y);
    
    color = mergeImg(st, color, color2, mask1*mask2);
    //color = color2;
    //color = mix(color,border,1.-border.r);
    fragColor = premultiply(color, img.a);
    // fragColor = img;
}

