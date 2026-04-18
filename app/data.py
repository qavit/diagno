from __future__ import annotations

from app.models import Concept, ErrorCategory, ErrorType, Option, Question


CONCEPTS = [
    Concept(
        id="com_ratio",
        name="Center of mass distance relation",
        description="For two masses on a line, distances from the center of mass satisfy $m_1 r_1 = m_2 r_2$.",
    ),
    Concept(
        id="omega_to_v",
        name="Tangential speed from angular speed",
        description="In circular motion, tangential speed is $v = \\omega r$.",
    ),
    Concept(
        id="com_frame_momentum",
        name="Momentum in the center-of-mass frame",
        description="Total momentum is zero in the center-of-mass frame, so $p_{\\text{total}} = 0$.",
    ),
    Concept(
        id="single_particle_L",
        name="Angular momentum of one particle",
        description="Magnitude is $L = r_\\perp p = mvr$ for perpendicular velocity.",
    ),
    Concept(
        id="multi_body_L",
        name="Total angular momentum of a system",
        description="Total angular momentum is the sum of contributions from all bodies, so $L_{\\text{total}} = \\sum_i L_i$.",
    ),
    Concept(
        id="binary_system_modeling",
        name="Binary system modeling",
        description="Combine center-of-mass geometry, circular motion, momentum, and angular momentum consistently.",
    ),
]


ERROR_TYPES = [
    ErrorType(
        id="ignore_reference_frame",
        name="Ignored the reference frame",
        description="The student did not apply the center-of-mass frame condition when evaluating total momentum.",
        category=ErrorCategory.READING,
        hint_levels=[
            "What reference frame does the problem specify?",
            "In the center-of-mass frame, what is the total momentum of the whole system?",
            "That frame forces the vector sum of all momenta to be zero.",
        ],
    ),
    ErrorType(
        id="incorrect_center_of_mass_relation",
        name="Reversed center-of-mass relation",
        description="The student swapped which mass should be farther from the center of mass.",
        category=ErrorCategory.CONCEPT,
        hint_levels=[
            "Which mass should sit closer to the center of mass: the heavier one or the lighter one?",
            "Use $m_1 r_1 = m_2 r_2$ before substituting numbers.",
            "For masses $m$ and $5m$, the lighter mass must be five times farther from the center of mass.",
        ],
    ),
    ErrorType(
        id="wrong_omega_radius_link",
        name="Incorrect use of $v = \\omega r$",
        description="The student did not connect angular speed and radius correctly.",
        category=ErrorCategory.CONCEPT,
        hint_levels=[
            "For uniform circular motion, how is tangential speed related to angular speed?",
            "Each body has its own radius from the center of mass, so each speed is $\\omega$ times that radius.",
            "Compute $v_1 = \\omega r_1$ and $v_2 = \\omega r_2$ before finding momentum or angular momentum.",
        ],
    ),
    ErrorType(
        id="missing_component",
        name="Missing body contribution",
        description="The student only accounted for one body when summing total angular momentum.",
        category=ErrorCategory.MODELING,
        hint_levels=[
            "How many masses are orbiting in the system?",
            "Write one angular momentum term for each body around the same origin.",
            "The total angular momentum is $L_1 + L_2$, not just one term.",
        ],
    ),
    ErrorType(
        id="vector_direction_error",
        name="Momentum direction mistake",
        description="The student treated opposite momenta as if they pointed in the same direction.",
        category=ErrorCategory.VECTOR,
        hint_levels=[
            "Are the two linear momenta in the same direction or opposite directions in the center-of-mass frame?",
            "Total momentum is a vector sum, so sign or direction matters before taking magnitudes.",
            "The two bodies carry equal-magnitude opposite momenta in the center-of-mass frame.",
        ],
    ),
    ErrorType(
        id="algebra_error",
        name="Algebra or arithmetic error",
        description="The student used the right structure but simplified or computed incorrectly.",
        category=ErrorCategory.ALGEBRA,
        hint_levels=[
            "Your setup may be right. Recheck the substitution and simplification carefully.",
            "Keep common factors such as $m$, $d$, and $\\omega$ symbolic until the last step.",
            "After combining terms, the coefficient should simplify cleanly without changing the physical structure.",
        ],
    ),
    ErrorType(
        id="partial_system_model",
        name="Partial system model",
        description="The student answered only one requested quantity or failed to combine the momentum and angular momentum parts.",
        category=ErrorCategory.MODELING,
        hint_levels=[
            "Does the problem ask for one quantity or more than one?",
            "Separate the task into geometry, momentum, and angular momentum before combining the results.",
            "State total momentum first, then compute total angular momentum using both bodies.",
        ],
    ),
]


QUESTIONS = [
    Question(
        id="q1",
        statement="Two masses $m$ and $5m$ are separated by distance $d$. In the center-of-mass frame, what are their distances from the center of mass?",
        options=[
            Option(id="A", text="$r_m = d/6$, $r_{5m} = 5d/6$"),
            Option(id="B", text="$r_m = 5d/6$, $r_{5m} = d/6$"),
            Option(id="C", text="$r_m = d/2$, $r_{5m} = d/2$"),
            Option(id="D", text="$r_m = 5d/4$, $r_{5m} = d/4$"),
        ],
        correct_answer="B",
        concepts=["com_ratio"],
        error_map={
            "A": ["incorrect_center_of_mass_relation"],
            "C": ["incorrect_center_of_mass_relation"],
            "D": ["algebra_error"],
        },
        difficulty=1,
        next_rules={
            "incorrect_center_of_mass_relation": "q2",
            "algebra_error": "q3",
        },
    ),
    Question(
        id="q2",
        statement="A mass moves in a circle of radius $r$ around the center of mass with angular speed $\\omega$. Which expression gives its speed?",
        options=[
            Option(id="A", text="$v = r/\\omega$"),
            Option(id="B", text="$v = \\omega/r$"),
            Option(id="C", text="$v = \\omega r$"),
            Option(id="D", text="$v = \\omega r^2$"),
        ],
        correct_answer="C",
        concepts=["omega_to_v"],
        error_map={
            "A": ["wrong_omega_radius_link"],
            "B": ["wrong_omega_radius_link"],
            "D": ["algebra_error"],
        },
        difficulty=1,
        next_rules={
            "wrong_omega_radius_link": "q3",
            "algebra_error": "q4",
        },
    ),
    Question(
        id="q3",
        statement="In the center-of-mass frame of any isolated two-body system, what is the total momentum of the system?",
        options=[
            Option(id="A", text="Always zero"),
            Option(id="B", text="Equal to $mv$ of the lighter body"),
            Option(id="C", text="Equal to the sum of momentum magnitudes"),
            Option(id="D", text="Cannot be determined without the radii"),
        ],
        correct_answer="A",
        concepts=["com_frame_momentum"],
        error_map={
            "B": ["ignore_reference_frame", "missing_component"],
            "C": ["ignore_reference_frame", "vector_direction_error"],
            "D": ["ignore_reference_frame"],
        },
        difficulty=1,
        next_rules={
            "ignore_reference_frame": "q7",
            "vector_direction_error": "q8",
            "missing_component": "q9",
        },
    ),
    Question(
        id="q4",
        statement="A particle of mass $m$ moves perpendicular to the radius vector at speed $v$, at distance $r$ from the origin. What is the magnitude of its angular momentum about the origin?",
        options=[
            Option(id="A", text="$L = mvr$"),
            Option(id="B", text="$L = mv/r$"),
            Option(id="C", text="$L = mr/v$"),
            Option(id="D", text="$L = mv + r$"),
        ],
        correct_answer="A",
        concepts=["single_particle_L"],
        error_map={
            "B": ["algebra_error"],
            "C": ["algebra_error"],
            "D": ["wrong_omega_radius_link"],
        },
        difficulty=1,
        next_rules={
            "algebra_error": "q5",
            "wrong_omega_radius_link": "q5",
        },
    ),
    Question(
        id="q5",
        statement="In a binary system, each body contributes angular momentum about the center of mass. Which expression matches the total angular momentum?",
        options=[
            Option(id="A", text="$L_{\\text{total}} = L_1$"),
            Option(id="B", text="$L_{\\text{total}} = L_1 + L_2$"),
            Option(id="C", text="$L_{\\text{total}} = L_1 - L_2$ because the bodies are on opposite sides"),
            Option(id="D", text="$L_{\\text{total}} = 0$ in the center-of-mass frame"),
        ],
        correct_answer="B",
        concepts=["multi_body_L"],
        error_map={
            "A": ["missing_component"],
            "C": ["vector_direction_error"],
            "D": ["ignore_reference_frame"],
        },
        difficulty=2,
        next_rules={
            "missing_component": "q9",
            "vector_direction_error": "q8",
            "ignore_reference_frame": "q7",
        },
    ),
    Question(
        id="q6",
        statement="For masses $m$ and $5m$ separated by $d$ in circular motion about their center of mass, what are the speeds of the two masses?",
        options=[
            Option(id="A", text="$v_m = \\omega d/6$, $v_{5m} = 5\\omega d/6$"),
            Option(id="B", text="$v_m = 5\\omega d/6$, $v_{5m} = \\omega d/6$"),
            Option(id="C", text="$v_m = v_{5m} = \\omega d/2$"),
            Option(id="D", text="$v_m = 5\\omega d$, $v_{5m} = \\omega d$"),
        ],
        correct_answer="B",
        concepts=["com_ratio", "omega_to_v"],
        error_map={
            "A": ["incorrect_center_of_mass_relation", "wrong_omega_radius_link"],
            "C": ["incorrect_center_of_mass_relation"],
            "D": ["algebra_error"],
        },
        difficulty=2,
        next_rules={
            "incorrect_center_of_mass_relation": "q1",
            "wrong_omega_radius_link": "q2",
            "algebra_error": "q10",
        },
    ),
    Question(
        id="q7",
        statement="Binary system: masses $m$ and $5m$ are separated by $d$ and rotate with angular speed $\\omega$ about their center of mass. What is the total momentum in the center-of-mass frame?",
        options=[
            Option(id="A", text="0"),
            Option(id="B", text="$m\\omega d$"),
            Option(id="C", text="$5m\\omega d$"),
            Option(id="D", text="$m(5\\omega d/6) + 5m(\\omega d/6)$"),
        ],
        correct_answer="A",
        concepts=["com_frame_momentum", "omega_to_v", "binary_system_modeling"],
        error_map={
            "B": ["ignore_reference_frame", "algebra_error"],
            "C": ["ignore_reference_frame", "missing_component"],
            "D": ["ignore_reference_frame", "vector_direction_error"],
        },
        difficulty=2,
        next_rules={
            "ignore_reference_frame": "q3",
            "vector_direction_error": "q8",
            "missing_component": "q9",
            "algebra_error": "q10",
        },
    ),
    Question(
        id="q8",
        statement="Two bodies orbit the center of mass in opposite positions. Their momenta are equal in magnitude. How should those momenta combine for total momentum?",
        options=[
            Option(id="A", text="They add because magnitudes are positive"),
            Option(id="B", text="They cancel because the vectors are opposite"),
            Option(id="C", text="The heavier one wins"),
            Option(id="D", text="They cancel only if the radii are equal"),
        ],
        correct_answer="B",
        concepts=["com_frame_momentum"],
        error_map={
            "A": ["vector_direction_error"],
            "C": ["vector_direction_error", "incorrect_center_of_mass_relation"],
            "D": ["ignore_reference_frame"],
        },
        difficulty=2,
        next_rules={
            "vector_direction_error": "q7",
            "incorrect_center_of_mass_relation": "q1",
            "ignore_reference_frame": "q3",
        },
    ),
    Question(
        id="q9",
        statement="A student computes the angular momentum of only the lighter mass in a binary system and stops. What is the diagnostic issue?",
        options=[
            Option(id="A", text="Missing the other body's contribution"),
            Option(id="B", text="Used the wrong reference frame"),
            Option(id="C", text="Arithmetic error only"),
            Option(id="D", text="No issue"),
        ],
        correct_answer="A",
        concepts=["multi_body_L"],
        error_map={
            "B": ["ignore_reference_frame"],
            "C": ["algebra_error"],
            "D": ["missing_component"],
        },
        difficulty=2,
        next_rules={
            "missing_component": "q5",
            "ignore_reference_frame": "q3",
            "algebra_error": "q10",
        },
    ),
    Question(
        id="q10",
        statement="Full problem: masses $m$ and $5m$ are separated by $d$ and rotate with angular speed $\\omega$. In the center-of-mass frame, what is the correct pair $(\\text{total momentum}, \\text{total angular momentum})$?",
        options=[
            Option(id="A", text="$(0, \\frac{5}{6} m d^2 \\omega)$"),
            Option(id="B", text="$(m\\omega d, \\frac{5}{6} m d^2 \\omega)$"),
            Option(id="C", text="$(0, \\frac{5}{36} m d^2 \\omega)$"),
            Option(id="D", text="$(0, \\frac{25}{36} m d^2 \\omega)$"),
        ],
        correct_answer="A",
        concepts=[
            "com_ratio",
            "omega_to_v",
            "com_frame_momentum",
            "single_particle_L",
            "multi_body_L",
            "binary_system_modeling",
        ],
        error_map={
            "B": ["ignore_reference_frame", "partial_system_model"],
            "C": ["missing_component"],
            "D": ["incorrect_center_of_mass_relation", "algebra_error"],
        },
        difficulty=3,
        next_rules={
            "ignore_reference_frame": "q7",
            "partial_system_model": "q5",
            "missing_component": "q9",
            "incorrect_center_of_mass_relation": "q1",
            "algebra_error": "q6",
        },
    ),
]


CONCEPT_INDEX = {concept.id: concept for concept in CONCEPTS}
ERROR_INDEX = {error.id: error for error in ERROR_TYPES}
QUESTION_INDEX = {question.id: question for question in QUESTIONS}
