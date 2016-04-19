(function(global){
	var between = function(s,e) {
		return (e - s) * Math.random() + s;
	}

	global.Play = jsfx.Sounds2({
		"sheep_fast": function(){
			return	{
				"Frequency": {
					"Start":between(60,120),
					"Slide":between(0.4,0.5),
					"DeltaSlide":between(-0.97, -0.90),
				},
				"Generator": { "Func":"saw" },
				"Volume": {
					"Sustain": between(0.2, 0.3),
					"Decay": between(0.075, 0.085),
					"Punch": 0,
					"Attack": 0.021
				},
				"Phaser":{
					"Offset": between(0.30, 0.40),
					"Sweep": between(-0.05, 0)
				}
			};
		},
		"sheep_slow": function(){
			return {
				"Frequency":{
					"Start": between(110, 200),
					"Slide": between(0.04, 0.09),
					"DeltaSlide": between(-0.30, -0.20)
				},
				"Generator":{"Func":"saw"},
				"Phaser":{
					"Offset": between(0.0100, 0.0150),
					"Sweep": between(-0.120, -0.130)
				},
				"Volume":{
					"Sustain": between(0.45,0.55),
					"Decay": between(0.1, 0.2),
					"Punch": between(0.3, 0.4),
					"Attack": 0.151
				},
				"Vibrato":{
					"Depth":0,
					"Frequency":0.01
				}
			}
		},
		"sheep_frightened": function(){
			return {
				"Frequency":{
					"Start":between(248, 280),
					"Slide": between(0.04, 0.09),
					"ChangeSpeed": 0.5,
					"ChangeAmount": 0,
					"DeltaSlide": -0.23,
					"RepeatSpeed": 1.44
				},
				"Generator":{"Func":"triangle"},
				"Phaser":{
					"Offset":0.12,
					"Sweep":-0.12527429157411227
				},
				"Volume":{
					"Sustain": between(0.15, 0.25),
					"Decay": between(0.30, 0.35),
					"Punch": 0,
					"Attack":0.001,
					"Master":0.5
				}
			};
		},
		"switch_on_device":{
			"Frequency":{
				"Start":57.93568975236963,
				"Min":1002.0381643024346,
				"Max":710.3955470820301,
				"Slide":-0.8562279548039706,
				"DeltaSlide":0.771000969129489,
				"RepeatSpeed":0.40079688849378314,
				"ChangeAmount":6.444101423807197,
				"ChangeSpeed":0.7194260431951014
			},
			"Vibrato":{
				"Depth":0.7327288894621757,
				"DepthSlide":-0.1416873417546567,
				"Frequency":6.520588567325221,
				"FrequencySlide":-0.1621352079765659
			},
			"Generator":{
				"Func":"triangle",
				"A":0.436010020050807,
				"B":0.9933536623167334,
				"ASlide":-0.196815963334378,
				"BSlide":-0.7485171569801445
			},
			"Phaser":{
				"Offset":-0.2159160058474483,
				"Sweep":0.5890210755456886
			},"Volume":{
				"Master":0.4,
				"Attack":0.37423822176655336,
				"Sustain":0.7642911933619119,
				"Punch":0.9536375201805434,
				"Decay":1.2161901179627896
			}
		},
		"splash": function(){
			return {
				"Frequency":{
					"Start": between(400, 700)
				},
				"Generator":{ "Func":"noise" },
				"Filter":{
					"HP":0.19,
					"LPResonance":0.89,
					"LP":0.81,
					"HPSlide":0.81
				},
				"Volume":{
					"Sustain": between(0.45, 0.55),
					"Decay": between(0.4, 0.6),
					"Attack": between(0.04, 0.1),
					"Punch": between(2, 3)
				}
			};
		},
		"shearing": function(){
			return {
				"Frequency":{
					"Start": 120,
					"Slide": 0.06
				},
				"Generator":{"Func":"saw","A":0.1319972311777132},
				"Filter":{"HP":between(0, 0.2),"LP":1},
				"Volume":{
					"Sustain": between(0.15, 0.2),
					"Decay": between(0.5, 1),
					"Punch": 3
				},
				"Vibrato":{"Depth":0},
				"Phaser":{
					"Offset":0.85,
					"Sweep":0.15
				}
			};
		},
		"alien_laughing": function(){
			return {
				"Frequency":{
					//"Start": between(300, 400),
					"Start": between(200, 300),
					"Slide": 0.14,
					"RepeatSpeed": 0.19,
					"ChangeAmount": 0,
					"ChangeSpeed": 0,
					"DeltaSlide": -0.02
				},
				"Generator":{ "Func": "alien" },
				"Volume":{
					"Sustain": between(0.3, 0.4),
					"Decay": between(0.3, 0.4),
					"Punch": between(0.1, 1.4),
					"Attack": between(0.01, 0.05)
				}
			};
		},
		"spaceship_bean":{"Frequency":{"Start":654.1350609514428,"Min":1588.6156800923354,"Max":728.6339586294337,"Slide":-0.836976109581951,"DeltaSlide":-0.6690110740019803,"RepeatSpeed":2.581103881930507,"ChangeAmount":6.610951968407079,"ChangeSpeed":0.3590150123733258},"Vibrato":{"Depth":0.7497510508546339,"DepthSlide":0.42547299414076134,"Frequency":42.406753677210865,"FrequencySlide":-0.3451357302648912},"Generator":{"Func":"sine","A":0.7371882330952262,"B":0.3252011539280799,"ASlide":0.4813833797095244,"BSlide":-0.1414001326283243},"Guitar":{"A":0.44493676107040936,"B":0.8763989334322795,"C":0.09048755020055355},"Phaser":{"Offset":0.912107289062781,"Sweep":-0.607675451407979},"Volume":{"Master":0.4,"Attack":0.8785877849090976,"Sustain":1.2692934651213412,"Punch":2.238808547549553,"Decay":1.8880538887472633}},
		"spaceship_phaser":{"Frequency":{"Start":579.7411424438418,"Min":1757.6553810670364,"Max":1671.5658537987113,"Slide":-0.9135015658452881,"DeltaSlide":0.2090384233067959,"RepeatSpeed":2.429909750901707,"ChangeAmount":-11.080549449487455,"ChangeSpeed":0.11773034957939155},"Vibrato":{"Depth":0.3501335053088004,"DepthSlide":-0.061649449347552565,"Frequency":16.17330729833351,"FrequencySlide":-0.31043106246825136},"Generator":{"Func":"sine","A":0.5840233387673208,"B":0.7101433211011374,"ASlide":0.4350189533006552,"BSlide":0.9248471893146903},"Guitar":{"A":0.5224574818899439,"B":0.3304927119556491,"C":0.8147089805134604},"Phaser":{"Offset":-0.3143645844610843,"Sweep":0.8352550028192263},"Volume":{"Master":0.4,"Attack":0.19759655149611416,"Sustain":0.8769473351690742,"Punch":2.9835758962319536,"Decay":1.6760438685702317}}
	});

	global.Play.say = {
		allyourbase: jsfx.Alien("all your base are belongs to us"),
		token: jsfx.Alien("it is a token", 0.1)
	};
})(this);
