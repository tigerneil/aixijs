import {SimpleAgent} from "./agent";
import {Model} from "../models/model"
import {Planner} from "../planners/planner"
import {ExpectimaxTree} from "../planners/mcts"
import {BayesTrace} from "../util/trace"
import {Action, Percept} from "../util/x"
import {BayesMixture} from "../models/mixture"
import {GeometricDiscount} from "../util/discount"

class BayesAgent extends SimpleAgent {
	samples: number;
	timeout: number;
	horizon: number;
	ucb: number;
	maxReward: number;
	minReward: number;
	informationGain: number;
	model: Model;
	planner: Planner;
	plan: Action[];
	// TODO: this repeats Agent.defaults. is there another way?
	static defaults = { 
		cycles: 2e2, 
		discount: GeometricDiscount,
		discountParams: {
			   gamma: 0.99
		  },
		horizon: 6,
		samples: 600,
		ucb: 1.4,
		model: BayesMixture,
		modelParametrization: 'goal'
	}
	constructor(options) {
		super(options);
		this.samples = options.samples;
		this.timeout = options.timeout;
		this.horizon = options.horizon;
		this.ucb = options.ucb;
		this.maxReward = options.maxReward;
		this.minReward = options.minReward;

		// TODO assert options OK
		this.informationGain = 0;
		this.tracer = options.tracer || BayesTrace;
		this.model = options.model;
		this.planner = new ExpectimaxTree(options,this.reward,this.discount);
		this.lastAction = null;
	}

	update(a, e) {
		super.update(a, e);
		this.model.save();
		this.model.update(a, e);
		this.informationGain = this.model.infoGain();
	}

	selectAction(e) {
		this.planner.reset(this.lastAction, e, this.age);
	
		let a = this.planner.bestAction();
		this.plan = this.planner.getPlan();
		this.lastAction = a;

		return a;
	}
}