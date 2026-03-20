from typing import Dict
from sqlalchemy import or_, and_

from Delivery_app_BK.models import db, DeliveryPlan
from Delivery_app_BK.services.utils import inject_team_id, model_requires_team

from ...context import ServiceContext
from ...utils import to_datetime

from ..order.find_orders import find_orders
from ..utils import apply_opaque_pagination_by_date

"""
 for adding a filter use:
    if "" in params:
        query = query.filter( DeliveryPlan.  params[""])

"""

def find_plans( params:Dict, ctx:ServiceContext ):

    query = db.session.query(DeliveryPlan)

    if model_requires_team( DeliveryPlan ) and ctx.inject_team_id:
        params = inject_team_id( params, ctx )
    
    if "team_id" in params:
        query = query.filter( DeliveryPlan.team_id == params.get( "team_id" ) )


    if "label" in params:
        label = params.get("label", "").strip()
        query = query.filter( DeliveryPlan.label.ilike( f"{label}%") )

    if "plan_type" in params:
        query = query.filter( DeliveryPlan.plan_type == params["plan_type"] )

    if "start_date" in params:
        start_date = to_datetime( params[ "start_date" ] )
        query = query.filter( DeliveryPlan.start_date >= start_date ) 

    if "end_date" in params:
        end_date = to_datetime( params[ "end_date" ] )
        query = query.filter( DeliveryPlan.end_date <= end_date )

    if "created_at_from" in params:
        created_at_from = to_datetime( params[ "created_at_from" ] )
        query = query.filter( DeliveryPlan.created_at >= created_at_from )
        
    if "created_at_to" in params:
        created_at_to = to_datetime( params[ "created_at_to" ] )
        query = query.filter( DeliveryPlan.created_at <= created_at_to )

    if "plan_state_id" in params:
        query = query.filter( DeliveryPlan.plan_state_id == params["plan_state_id"] )

    # overlap filter: find plans whose window covers a target date range
    # condition: plan.start_date <= covers_end AND plan.end_date >= covers_start
    if "covers_start" in params and "covers_end" in params:
        covers_start = to_datetime( params["covers_start"] )
        covers_end   = to_datetime( params["covers_end"] )
        query = query.filter(
            DeliveryPlan.start_date <= covers_end,
            DeliveryPlan.end_date   >= covers_start,
        )

    # order count filters (uses denormalized total_orders column)
    if "max_orders" in params:
        query = query.filter( DeliveryPlan.total_orders <= int(params["max_orders"]) )

    if "min_orders" in params:
        query = query.filter( DeliveryPlan.total_orders >= int(params["min_orders"]) )


    # query on orders table --------------------------------------------
    order_params = params.get( "orders" )
    if order_params:
        query = query.join( DeliveryPlan.orders )
        query = find_orders(
            params = order_params,
            ctx = ctx,
            query = query, 
        )
    #-----------------------------------------------

    # sort query by date_asc or date_desc -------------------------

    if params.get("sort") == 'date_asc':
        query = query.order_by( 
            DeliveryPlan.created_at.asc(),
            DeliveryPlan.id.asc()
        )
    else:
        query = query.order_by( 
            DeliveryPlan.created_at.desc(),
            DeliveryPlan.id.desc()
        )

    #----------------------------------------------------


    # pagination -------------------------

    query = apply_opaque_pagination_by_date(
        query = query,
        date_column = DeliveryPlan.created_at,
        id_column = DeliveryPlan.id,
        params = params,
        sort = params.get( "sort", 'date_desc')
    )

    #----------------------------------------------------
    
    return query.distinct()
